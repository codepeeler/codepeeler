import type { ChainVarScope } from "@/lib/api-tester/types";

/* ============================= AI Assistant client =============================
 * Thin wrappers around POST /api/ai. The server route owns the API key and the
 * per-task system prompts; this file just shapes requests/responses for the UI
 * so components never touch fetch() or raw prompt strings directly.
 */

export interface AiRequestDraft {
  method: string;
  url: string;
  params: { key: string; value: string }[];
  headers: { key: string; value: string }[];
  bodyMode: "none" | "raw" | "urlencoded";
  bodyRawType: "json" | "text";
  bodyRaw: string;
  explanation: string;
}

export interface AiChainSuggestion {
  sourcePath: string;
  varName: string;
  scope: ChainVarScope;
  reason: string;
}

export class AiError extends Error {}

/** Header names whose values should never be sent to a third-party AI provider, even for a
 *  "describe this request" or "build me a request" call — the request itself only needs the
 *  {{placeholder}} form, not a real bearer token / cookie / API key. Rows explicitly marked
 *  `secret` are redacted too, regardless of header name. */
const SENSITIVE_HEADER_NAMES = new Set(["authorization", "cookie", "set-cookie", "x-api-key", "api-key", "x-auth-token", "proxy-authorization"]);

export function redactHeadersForAi(headers: { key: string; value: string; secret?: boolean }[]): { key: string; value: string }[] {
  return headers
    .filter((h) => h.key)
    .map((h) => ({
      key: h.key,
      value: h.secret || SENSITIVE_HEADER_NAMES.has(h.key.trim().toLowerCase()) ? "[REDACTED]" : h.value,
    }));
}


function stripFences(s: string): string {
  return s
    .trim()
    .replace(/^```[a-zA-Z]*\n?/, "")
    .replace(/```$/, "")
    .trim();
}

function safeJsonParse(raw: string): Record<string, unknown> {
  const cleaned = stripFences(raw);
  try {
    return JSON.parse(cleaned);
  } catch {
    // Sometimes the model wraps the JSON with a stray sentence; try to grab the {...} span.
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        /* fall through */
      }
    }
    throw new AiError("The AI response wasn't valid JSON — try again, or rephrase.");
  }
}

async function callAi(task: string, input: Record<string, unknown>): Promise<string> {
  let res: Response;
  try {
    res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, input }),
    });
  } catch {
    throw new AiError("Couldn't reach the AI Assistant endpoint. Check your connection and try again.");
  }
  const data: { content?: string; aiError?: string } = await res.json().catch(() => ({}));
  if (!res.ok || data.aiError) throw new AiError(data.aiError || `AI request failed (${res.status})`);
  return data.content || "";
}

export async function aiNlToRequest(prompt: string, contextHint?: string): Promise<AiRequestDraft> {
  const parsed = safeJsonParse(await callAi("nl_to_request", { prompt, contextHint }));
  const params = Array.isArray(parsed.params) ? (parsed.params as { key: string; value: string }[]) : [];
  const headers = Array.isArray(parsed.headers) ? (parsed.headers as { key: string; value: string }[]) : [];
  return {
    method: String(parsed.method || "GET").toUpperCase(),
    url: String(parsed.url || ""),
    params,
    headers,
    bodyMode: parsed.bodyMode === "raw" || parsed.bodyMode === "urlencoded" ? parsed.bodyMode : "none",
    bodyRawType: parsed.bodyRawType === "text" ? "text" : "json",
    bodyRaw: String(parsed.bodyRaw || ""),
    explanation: String(parsed.explanation || ""),
  };
}

export async function aiExplainFailure(args: {
  failingTests: { name: string; error?: string }[];
  status: number;
  bodySnippet: string;
}): Promise<string> {
  return stripFences(await callAi("explain_failure", args));
}

export async function aiFixTestScript(args: {
  currentScript: string;
  failingTests: { name: string; error?: string }[];
  status: number;
  bodySnippet: string;
}): Promise<string> {
  return stripFences(await callAi("fix_test_script", args));
}

export async function aiGenerateTests(args: {
  method: string;
  url: string;
  status: number;
  headers: Record<string, string>;
  bodySnippet: string;
}): Promise<string> {
  return stripFences(await callAi("generate_tests", args));
}

export async function aiExplainRequest(args: {
  method?: string;
  url?: string;
  headers?: { key: string; value: string }[];
  bodySnippet?: string;
  curl?: string;
}): Promise<string> {
  return stripFences(await callAi("explain_request", args));
}

export async function aiSuggestChain(args: { method: string; url: string; bodySnippet: string }): Promise<AiChainSuggestion[]> {
  const parsed = safeJsonParse(await callAi("suggest_chain", args));
  const list = Array.isArray(parsed.suggestions) ? (parsed.suggestions as Record<string, unknown>[]) : [];
  return list
    .filter((s) => s && s.sourcePath && s.varName)
    .map((s) => ({
      sourcePath: String(s.sourcePath),
      varName: String(s.varName),
      scope: (s.scope === "collection" || s.scope === "global" ? s.scope : "environment") as ChainVarScope,
      reason: String(s.reason || ""),
    }));
}
