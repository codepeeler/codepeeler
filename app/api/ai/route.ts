import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserEntitlements, hasCapability } from "@/lib/entitlements";
import { checkUsageLimit, incrementUsage } from "@/lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Single endpoint for every "AI Assistant" feature in the API Tester (NL -> request,
 * explain/fix a failing test, generate tests from a response, explain a request/curl in
 * plain English, suggest chain-extraction variables). Keeping this behind one route with a
 * `task` switch means the browser never sees an API key, and swapping/adding providers only
 * touches this file.
 *
 * PROVIDER CHAIN: every provider below that has its env var set gets tried in order —
 * Groq first (fastest, most generous free tier), then Gemini, then OpenRouter's free models.
 * If one is rate-limited, down, or errors out, the next configured one is tried automatically,
 * so a single provider hitting its free-tier cap doesn't take the AI Assistant down.
 * Add a fourth provider by adding one more entry to PROVIDERS — everything else just works.
 */

interface Provider {
  envKey: string;
  name: string;
  url: string;
  model: string;
  extraHeaders?: Record<string, string>;
  supportsJsonMode?: boolean;
}

const PROVIDERS: Provider[] = [
  {
    envKey: "GROQ_API_KEY",
    name: "Groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    supportsJsonMode: true,
  },
  {
    envKey: "GEMINI_API_KEY",
    name: "Gemini",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    model: "gemini-2.0-flash",
    supportsJsonMode: true,
  },
  {
    envKey: "OPENROUTER_API_KEY",
    name: "OpenRouter",
    url: "https://openrouter.ai/api/v1/chat/completions",
    // OpenRouter rotates which models are free — check openrouter.ai/models?max_price=0
    // and override with OPENROUTER_MODEL in .env.local if this one stops being available.
    model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
    extraHeaders: { "HTTP-Referer": "https://codepeeler.local", "X-Title": "Codepeeler AI Assistant" },
    supportsJsonMode: false,
  },
];

type AiTask =
  | "nl_to_request"
  | "explain_failure"
  | "fix_test_script"
  | "generate_tests"
  | "explain_request"
  | "suggest_chain";

interface AiPayload {
  task: AiTask;
  input: Record<string, unknown>;
}

const TEST_API_DOCS = `The sandboxed test-script API available as "pt":
- pt.test(name: string, fn: () => void) — registers one assertion group.
- pt.expect(actual).toBe(exp) / .toEqual(exp) / .toBeBetween(min, max) / .toInclude(substring) / .toExist() / .toBeLessThan(n) / .toBeGreaterThan(n)
- pt.response.status, pt.response.statusText, pt.response.headers, pt.response.duration, pt.response.size, pt.response.json(), pt.response.text()
- pt.environment.get(key) / pt.environment.set(key, value)
- pt.variables.get(key) / pt.variables.set(key, value)
Only use methods from this exact list — nothing else exists in the sandbox (no require, no fetch, no async/await needed).`;

function systemPromptFor(task: AiTask): string {
  switch (task) {
    case "nl_to_request":
      return `You are an assistant embedded in an API testing tool (like Postman). Convert the user's plain-English description of an HTTP request into a JSON object with EXACTLY this shape and nothing else:
{
  "method": "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  "url": string,
  "params": [{"key": string, "value": string}],
  "headers": [{"key": string, "value": string}],
  "bodyMode": "none" | "raw" | "urlencoded",
  "bodyRawType": "json" | "text",
  "bodyRaw": string,
  "explanation": string
}
Rules: prefer {{variable}} placeholders (e.g. {{base_url}}, {{token}}) over guessed real domains when the user didn't give one. Only include a body for methods that typically have one. "explanation" is one short sentence in plain English summarizing what you built. Respond with ONLY the JSON object — no markdown code fences, no commentary before or after.`;

    case "explain_failure":
      return `You are a debugging assistant embedded in an API testing tool. The user has one or more failing test assertions. Given the test name(s), the error message(s), and details of the actual HTTP response, explain in plain, simple English why it likely failed and what to check first. Be concrete — reference the actual status code / values given, don't speak in generalities. 3-5 sentences, plain text only, no markdown headers, no code fences.`;

    case "fix_test_script":
      return `You are an assistant embedded in an API testing tool. ${TEST_API_DOCS}
Given the user's current (failing) test script and the actual response details, rewrite the FULL test script so its assertions correctly reflect the real response — fix wrong expected values, wrong paths, or overly strict checks. Keep any tests that already pass. Respond with ONLY the raw JavaScript for the new script — no markdown code fences, no commentary, no explanation text.`;

    case "generate_tests":
      return `You are an assistant embedded in an API testing tool. ${TEST_API_DOCS}
Given details of an HTTP response (status, headers, a body sample, method and URL), write a complete test script with 3-6 meaningful assertions: status code, presence/type of key response fields, and a sane response-time check. Base every assertion on values actually present in the sample — don't invent fields that aren't there. Respond with ONLY the raw JavaScript for the script — no markdown code fences, no commentary.`;

    case "explain_request":
      return `You are a technical writer embedded in an API testing tool. Given a raw HTTP request (method, URL, headers, body) or a pasted cURL command, write a clear, concise 2-4 sentence description of what this request does and any notable auth/body/header details — suitable as saved documentation for a teammate. Plain text only, no markdown headers, no code fences.`;

    case "suggest_chain":
      return `You are an assistant embedded in an API testing tool. It supports "chain extraction": saving a value from a JSON response into a variable (referenced elsewhere as {{varName}}) via a dot/bracket path like "data.items[0].id". Given a sample JSON response body, suggest up to 4 good candidate fields to extract (ids, tokens, cursors/pagination keys, slugs) as a JSON object with EXACTLY this shape and nothing else:
{"suggestions": [{"sourcePath": string, "varName": string, "scope": "environment" | "collection" | "global", "reason": string}]}
Only suggest paths that actually exist in the sample given. Respond with ONLY the JSON object — no markdown code fences, no commentary.`;
  }
}

function truncate(s: string | undefined | null, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + `… (truncated, ${s.length} chars total)` : s;
}

function userPromptFor(task: AiTask, input: Record<string, unknown>): string {
  const str = (v: unknown) => (v == null ? "" : String(v));
  const failingList = (v: unknown) =>
    (Array.isArray(v) ? v : [])
      .map((t) => `- "${str((t as Record<string, unknown>)?.name)}": ${str((t as Record<string, unknown>)?.error) || "no error message"}`)
      .join("\n");

  switch (task) {
    case "nl_to_request":
      return `Description: ${str(input.prompt)}\n${input.contextHint ? `Context (available environment variables): ${str(input.contextHint)}` : ""}`;

    case "explain_failure":
      return `Failing test(s):\n${failingList(input.failingTests)}\n\nActual response: status ${str(input.status)}, body sample:\n${truncate(str(input.bodySnippet), 3000)}`;

    case "fix_test_script":
      return `Current test script:\n\`\`\`js\n${str(input.currentScript)}\n\`\`\`\n\nFailing assertions:\n${failingList(input.failingTests)}\n\nActual response: status ${str(input.status)}, body sample:\n${truncate(str(input.bodySnippet), 3000)}`;

    case "generate_tests":
      return `Method: ${str(input.method)}\nURL: ${str(input.url)}\nStatus: ${str(input.status)}\nHeaders: ${JSON.stringify(input.headers || {}).slice(0, 500)}\nBody sample:\n${truncate(str(input.bodySnippet), 3000)}`;

    case "explain_request":
      if (input.curl) return `cURL command:\n${truncate(str(input.curl), 3000)}`;
      return `Method: ${str(input.method)}\nURL: ${str(input.url)}\nHeaders: ${JSON.stringify(input.headers || [])}\nBody sample:\n${truncate(str(input.bodySnippet), 2000)}`;

    case "suggest_chain":
      return `Method: ${str(input.method)}\nURL: ${str(input.url)}\nBody sample:\n${truncate(str(input.bodySnippet), 3000)}`;
  }
}

async function callProvider(provider: Provider, apiKey: string, messages: { role: string; content: string }[], wantsJson: boolean): Promise<string> {
  const wantJsonHere = wantsJson && !!provider.supportsJsonMode;
  const body = {
    model: provider.model,
    messages,
    temperature: 0.2,
    max_tokens: 1200,
    ...(wantJsonHere ? { response_format: { type: "json_object" } } : {}),
  };

  const res = await fetch(provider.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, ...(provider.extraHeaders || {}) },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = truncate(await res.text(), 300);
    // Some providers/models 400 specifically on response_format — retry once without it rather
    // than burning this provider's turn in the chain over a formatting flag.
    if (wantJsonHere && res.status === 400) {
      const retryRes = await fetch(provider.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, ...(provider.extraHeaders || {}) },
        body: JSON.stringify({ ...body, response_format: undefined }),
      });
      if (retryRes.ok) {
        const retryData = await retryRes.json();
        return retryData?.choices?.[0]?.message?.content ?? "";
      }
    }
    throw new Error(`${provider.name} API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: NextRequest) {
  // AI calls hit a real (rate-limited, sometimes paid) provider — this is the
  // one route in the app where an unauthenticated or free-plan caller can
  // directly cost money, so it gets checked before anything else runs.
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ aiError: "Not authenticated" }, { status: 401 });
  }

  const entitlements = await getUserEntitlements(session.user.id);
  if (!hasCapability(entitlements, "ai-assist")) {
    return NextResponse.json(
      { aiError: "AI Assistant is a Pro feature. Upgrade to Pro to use it.", upgradeUrl: "/pricing" },
      { status: 402 }
    );
  }

  const usageGate = await checkUsageLimit(session.user.id, "ai-calls", entitlements.limits.aiCallsPerMonth);
  if (!usageGate.allowed) {
    return NextResponse.json(
      {
        aiError: `Monthly AI Assistant limit reached (${usageGate.used}/${usageGate.limit}). Resets next month.`,
        upgradeUrl: "/pricing",
      },
      { status: 402 }
    );
  }

  const configured = PROVIDERS.map((p) => ({ provider: p, apiKey: process.env[p.envKey] })).filter(
    (c): c is { provider: Provider; apiKey: string } => !!c.apiKey
  );

  if (configured.length === 0) {
    return NextResponse.json(
      {
        aiError:
          "No AI provider configured. Add at least one of GROQ_API_KEY (recommended — free & fast at console.groq.com/keys), GEMINI_API_KEY, or OPENROUTER_API_KEY to your .env.local, then restart the dev server.",
      },
      { status: 500 }
    );
  }

  let payload: AiPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ aiError: "Invalid request payload" }, { status: 400 });
  }

  const { task, input } = payload;
  if (!task || !input) return NextResponse.json({ aiError: "Missing task or input" }, { status: 400 });

  const messages = [
    { role: "system", content: systemPromptFor(task) },
    { role: "user", content: userPromptFor(task, input) },
  ];
  const wantsJson = task === "nl_to_request" || task === "suggest_chain";

  const errors: string[] = [];
  for (const { provider, apiKey } of configured) {
    try {
      const content = await callProvider(provider, apiKey, messages, wantsJson);
      await incrementUsage(session.user.id, "ai-calls");
      return NextResponse.json({ content, provider: provider.name });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "unknown error";
      errors.push(`${provider.name}: ${msg}`);
      // Try the next configured provider in the chain.
    }
  }

  return NextResponse.json({ aiError: `All configured AI providers failed. ${errors.join(" | ")}` }, { status: 502 });
}
