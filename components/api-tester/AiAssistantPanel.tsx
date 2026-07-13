"use client";

import { useMemo, useState } from "react";
import { Sparkles, Wand2, Bug, FlaskConical, FileText, Link2, Loader2, Check, Plus, ArrowRight } from "lucide-react";
import { Modal } from "@/components/api-tester/Modals";
import { CapabilityGate } from "@/components/core/CapabilityGate";
import { useApiTester } from "@/providers/api-tester-provider";
import { newChainExtraction, newRow } from "@/lib/api-tester/engine";
import type { HttpMethod } from "@/lib/api-tester/types";
import { HTTP_METHODS } from "@/lib/api-tester/types";
import {
  AiError,
  aiExplainFailure,
  aiExplainRequest,
  aiFixTestScript,
  aiGenerateTests,
  aiNlToRequest,
  aiSuggestChain,
  redactHeadersForAi,
  type AiChainSuggestion,
  type AiRequestDraft,
} from "@/lib/api-tester/ai";

type AiMode = "build" | "fix" | "tests" | "explain" | "chain";

const MODES: { key: AiMode; label: string; icon: typeof Wand2 }[] = [
  { key: "build", label: "Build Request", icon: Wand2 },
  { key: "fix", label: "Explain & Fix Test", icon: Bug },
  { key: "tests", label: "Generate Tests", icon: FlaskConical },
  { key: "explain", label: "Explain / Docs", icon: FileText },
  { key: "chain", label: "Suggest Variables", icon: Link2 },
];

function ErrorBox({ message }: { message: string }) {
  return <div className="rounded-lg bg-[var(--danger-dim)] px-3 py-2 text-[12px] leading-[1.5] text-[var(--danger)]">{message}</div>;
}

function AskButton({ onClick, loading, disabled, children }: { onClick: () => void; loading: boolean; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="flex items-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] px-3.5 py-2 text-xs font-semibold text-white hover:brightness-[1.08] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
      {loading ? "Thinking…" : children}
    </button>
  );
}

/* ============================= Build Request ============================= */
function BuildRequestMode() {
  const { updateRequest, vars, toast } = useApiTester();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<AiRequestDraft | null>(null);

  const contextHint = useMemo(() => Object.keys(vars).slice(0, 12).join(", "), [vars]);

  const ask = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setDraft(null);
    try {
      setDraft(await aiNlToRequest(prompt.trim(), contextHint));
    } catch (e) {
      setError(e instanceof AiError ? e.message : "Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  };

  const apply = () => {
    if (!draft) return;
    const method = (HTTP_METHODS as string[]).includes(draft.method) ? (draft.method as HttpMethod) : "GET";
    updateRequest({
      method,
      url: draft.url,
      params: draft.params.length ? draft.params.map((p) => newRow({ key: p.key, value: p.value })) : [newRow()],
      headers: draft.headers.length ? draft.headers.map((h) => newRow({ key: h.key, value: h.value })) : [newRow()],
      body: { mode: draft.bodyMode, raw: draft.bodyRaw, rawType: draft.bodyRawType, formData: [newRow()], urlencoded: [newRow()] },
    });
    toast("AI-built request applied to this tab");
    setDraft(null);
    setPrompt("");
  };

  return (
    <div>
      <div className="mb-2 text-[11px] leading-[1.6] text-[var(--text-faint)]">
        Describe the request in plain English — mentions of your environment variables ({contextHint || "none set yet"}) will be used as hints.
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g. GET request that fetches a user's order history with pagination, using {{base_url}} and a bearer token"
        className="h-[84px] w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-2.5 text-[12.5px] outline-none focus:border-[var(--primary)]"
      />
      <div className="mt-2.5">
        <AskButton onClick={ask} loading={loading} disabled={!prompt.trim()}>Build request</AskButton>
      </div>
      {error && <div className="mt-2.5"><ErrorBox message={error} /></div>}
      {draft && (
        <div className="mt-3.5 rounded-lg border border-[var(--border-soft)] p-3">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="rounded-md bg-[var(--bg-elev)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[11px] font-bold"
              style={{ color: `var(--${draft.method.toLowerCase()})` }}
            >
              {draft.method}
            </span>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap font-[family-name:var(--font-mono)] text-[12px]">{draft.url}</span>
          </div>
          {draft.explanation && <div className="mb-2.5 text-[12px] leading-[1.5] text-[var(--text-dim)]">{draft.explanation}</div>}
          <div className="mb-2.5 flex flex-wrap gap-2.5 text-[11px] text-[var(--text-faint)]">
            <span>{draft.headers.length} header{draft.headers.length !== 1 ? "s" : ""}</span>
            <span>{draft.params.length} param{draft.params.length !== 1 ? "s" : ""}</span>
            <span>body: {draft.bodyMode}</span>
          </div>
          <button onClick={apply} className="flex items-center gap-1.5 rounded-lg bg-[var(--primary-dim)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--primary)]">
            <Check size={13} /> Apply to current tab
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================= Explain & Fix Test ============================= */
function FixTestMode() {
  const { activeTab, updateRequest, setReqTab, toast } = useApiTester();
  const [explanation, setExplanation] = useState("");
  const [fixedScript, setFixedScript] = useState("");
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [loadingFix, setLoadingFix] = useState(false);
  const [error, setError] = useState("");

  if (!activeTab) return null;
  const failing = (activeTab.testResults || []).filter((t) => !t.pass);
  const response = activeTab.response;

  if (!activeTab.testResults) {
    return <div className="text-[12.5px] leading-[1.6] text-[var(--text-faint)]">Send a request with a test script first — this mode explains and fixes whichever assertions come back failing.</div>;
  }
  if (!failing.length) {
    return <div className="text-[12.5px] font-semibold text-[var(--success)]">All {activeTab.testResults.length} test(s) are passing — nothing to fix here. 🎉</div>;
  }

  const explain = async () => {
    setLoadingExplain(true);
    setError("");
    try {
      setExplanation(
        await aiExplainFailure({
          failingTests: failing.map((t) => ({ name: t.name, error: t.error })),
          status: response?.status ?? 0,
          bodySnippet: (response?.bodyText || "").slice(0, 3000),
        })
      );
    } catch (e) {
      setError(e instanceof AiError ? e.message : "Something went wrong — try again.");
    } finally {
      setLoadingExplain(false);
    }
  };

  const fix = async () => {
    setLoadingFix(true);
    setError("");
    try {
      setFixedScript(
        await aiFixTestScript({
          currentScript: activeTab.request.testScript,
          failingTests: failing.map((t) => ({ name: t.name, error: t.error })),
          status: response?.status ?? 0,
          bodySnippet: (response?.bodyText || "").slice(0, 3000),
        })
      );
    } catch (e) {
      setError(e instanceof AiError ? e.message : "Something went wrong — try again.");
    } finally {
      setLoadingFix(false);
    }
  };

  const applyFix = () => {
    updateRequest({ testScript: fixedScript });
    setReqTab("tests");
    toast("Fixed test script applied — hit Send to re-run it");
    setFixedScript("");
  };

  return (
    <div>
      <div className="mb-2.5 rounded-lg bg-[var(--danger-dim)] px-3 py-2 text-[12px] leading-[1.5] text-[var(--danger)]">
        {failing.length} failing assertion{failing.length !== 1 ? "s" : ""}: {failing.map((t) => t.name).join(", ")}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={explain}
          disabled={loadingExplain}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)] disabled:opacity-40"
        >
          {loadingExplain ? <Loader2 size={13} className="animate-spin" /> : <Bug size={13} />} Explain why
        </button>
        <AskButton onClick={fix} loading={loadingFix}>Fix test script</AskButton>
      </div>
      {error && <div className="mt-2.5"><ErrorBox message={error} /></div>}
      {explanation && <div className="mt-3 rounded-lg border border-[var(--border-soft)] p-3 text-[12.5px] leading-[1.6]">{explanation}</div>}
      {fixedScript && (
        <div className="mt-3">
          <pre className="max-h-[220px] overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] p-2.5 font-[family-name:var(--font-mono)] text-[11.5px]">
            {fixedScript}
          </pre>
          <button onClick={applyFix} className="mt-2 flex items-center gap-1.5 rounded-lg bg-[var(--primary-dim)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--primary)]">
            <Check size={13} /> Apply fixed script
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================= Generate Tests ============================= */
function GenerateTestsMode() {
  const { activeTab, updateRequest, setReqTab, toast } = useApiTester();
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!activeTab) return null;
  const response = activeTab.response;
  if (!response) {
    return <div className="text-[12.5px] leading-[1.6] text-[var(--text-faint)]">Send the request first — tests are generated from the actual response you get back.</div>;
  }

  const generate = async () => {
    setLoading(true);
    setError("");
    setScript("");
    try {
      setScript(
        await aiGenerateTests({
          method: activeTab.request.method,
          url: activeTab.request.url,
          status: response.status,
          headers: response.headers,
          bodySnippet: response.bodyText.slice(0, 3000),
        })
      );
    } catch (e) {
      setError(e instanceof AiError ? e.message : "Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  };

  const apply = (mode: "replace" | "append") => {
    const current = activeTab.request.testScript || "";
    updateRequest({ testScript: mode === "append" && current.trim() ? `${current}\n\n${script}` : script });
    setReqTab("tests");
    toast("Test script applied");
    setScript("");
  };

  return (
    <div>
      <div className="mb-2.5 text-[11px] leading-[1.6] text-[var(--text-faint)]">
        Generates assertions from the last response — status {response.status}, {response.bodyText.length} byte body.
      </div>
      <AskButton onClick={generate} loading={loading}>Generate smart tests</AskButton>
      {error && <div className="mt-2.5"><ErrorBox message={error} /></div>}
      {script && (
        <div className="mt-3">
          <pre className="max-h-[240px] overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] p-2.5 font-[family-name:var(--font-mono)] text-[11.5px]">
            {script}
          </pre>
          <div className="mt-2 flex gap-2">
            <button onClick={() => apply("replace")} className="flex items-center gap-1.5 rounded-lg bg-[var(--primary-dim)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--primary)]">
              <Check size={13} /> Replace test script
            </button>
            <button onClick={() => apply("append")} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]">
              <Plus size={13} /> Append to existing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================= Explain / Docs ============================= */
function ExplainMode() {
  const { activeTab, updateRequest, setReqTab, toast } = useApiTester();
  const [curlInput, setCurlInput] = useState("");
  const [useCurl, setUseCurl] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!activeTab) return null;
  const req = activeTab.request;

  const explain = async () => {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const text =
        useCurl && curlInput.trim()
          ? await aiExplainRequest({ curl: curlInput.trim() })
          : await aiExplainRequest({
              method: req.method,
              url: req.url,
              headers: redactHeadersForAi(req.headers),
              bodySnippet: req.body.raw.slice(0, 2000),
            });
      setResult(text);
    } catch (e) {
      setError(e instanceof AiError ? e.message : "Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyToDocs = () => {
    updateRequest({ description: result });
    setReqTab("docs");
    toast("Saved to the Docs tab");
  };

  return (
    <div>
      <div className="mb-2.5 flex gap-1.5">
        <button
          onClick={() => setUseCurl(false)}
          className="rounded-lg px-3 py-1.5 text-[11.5px] font-semibold"
          style={{ background: !useCurl ? "var(--primary-dim)" : "var(--card)", color: !useCurl ? "var(--primary)" : "var(--text-dim)" }}
        >
          Current tab&apos;s request
        </button>
        <button
          onClick={() => setUseCurl(true)}
          className="rounded-lg px-3 py-1.5 text-[11.5px] font-semibold"
          style={{ background: useCurl ? "var(--primary-dim)" : "var(--card)", color: useCurl ? "var(--primary)" : "var(--text-dim)" }}
        >
          Paste a cURL command
        </button>
      </div>
      {useCurl ? (
        <textarea
          value={curlInput}
          onChange={(e) => setCurlInput(e.target.value)}
          placeholder="curl -X POST https://api.example.com/users -H 'Authorization: Bearer ...' -d '{...}'"
          className="h-[84px] w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-2.5 font-[family-name:var(--font-mono)] text-[12px] outline-none focus:border-[var(--primary)]"
        />
      ) : (
        <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] px-2.5 py-2 font-[family-name:var(--font-mono)] text-[12px]">
          <span style={{ color: `var(--${req.method.toLowerCase()})` }} className="font-bold">{req.method}</span> {req.url || <span className="text-[var(--text-faint)]">(no URL set)</span>}
        </div>
      )}
      <div className="mt-1.5 text-[10.5px] leading-[1.5] text-[var(--text-faint)]">Authorization/Cookie/API-key header values are never sent — only header names.</div>
      <div className="mt-2.5">
        <AskButton onClick={explain} loading={loading} disabled={useCurl && !curlInput.trim()}>Explain this request</AskButton>
      </div>
      {error && <div className="mt-2.5"><ErrorBox message={error} /></div>}
      {result && (
        <div className="mt-3 rounded-lg border border-[var(--border-soft)] p-3">
          <div className="text-[12.5px] leading-[1.6]">{result}</div>
          {!useCurl && (
            <button onClick={applyToDocs} className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-[var(--primary-dim)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--primary)]">
              <Check size={13} /> Save to Docs tab
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================= Suggest Chain Variables ============================= */
function ChainMode() {
  const { activeTab, updateRequest, toast } = useApiTester();
  const [suggestions, setSuggestions] = useState<AiChainSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState<Set<number>>(new Set());

  if (!activeTab) return null;
  const response = activeTab.response;
  if (!response) {
    return <div className="text-[12.5px] leading-[1.6] text-[var(--text-faint)]">Send the request first — suggestions are based on the actual response body.</div>;
  }

  const ask = async () => {
    setLoading(true);
    setError("");
    setSuggestions([]);
    setAdded(new Set());
    try {
      setSuggestions(
        await aiSuggestChain({ method: activeTab.request.method, url: activeTab.request.url, bodySnippet: response.bodyText.slice(0, 3000) })
      );
    } catch (e) {
      setError(e instanceof AiError ? e.message : "Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  };

  const addOne = (i: number) => {
    const s = suggestions[i];
    const existing = activeTab.request.chainExtractions || [];
    updateRequest({ chainExtractions: [...existing, newChainExtraction({ sourcePath: s.sourcePath, varName: s.varName, scope: s.scope })] });
    setAdded((prev) => new Set(prev).add(i));
    toast(`Added {{${s.varName}}} to Chain tab`);
  };

  return (
    <div>
      <div className="mb-2.5 text-[11px] leading-[1.6] text-[var(--text-faint)]">
        Suggests values worth saving as variables from the last response — ids, tokens, pagination cursors.
      </div>
      <AskButton onClick={ask} loading={loading}>Suggest variables</AskButton>
      {error && <div className="mt-2.5"><ErrorBox message={error} /></div>}
      {suggestions.length === 0 && !loading && !error && (
        <div className="mt-2.5 text-[11.5px] text-[var(--text-faint)]">No suggestions requested yet.</div>
      )}
      {suggestions.map((s, i) => (
        <div key={i} className="mt-2.5 rounded-lg border border-[var(--border-soft)] p-2.5">
          <div className="flex flex-wrap items-center gap-1.5 font-[family-name:var(--font-mono)] text-[12px]">
            <span className="text-[var(--text-dim)]">{s.sourcePath}</span>
            <ArrowRight size={12} className="flex-shrink-0 text-[var(--text-faint)]" />
            <span className="font-bold text-[var(--primary)]">{"{{" + s.varName + "}}"}</span>
            <span className="rounded-md bg-[var(--bg-elev)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-faint)]">{s.scope}</span>
          </div>
          {s.reason && <div className="mt-1 text-[11.5px] leading-[1.5] text-[var(--text-faint)]">{s.reason}</div>}
          <button
            onClick={() => addOne(i)}
            disabled={added.has(i)}
            className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-[var(--primary-dim)] px-2.5 py-1 text-[11px] font-semibold text-[var(--primary)] disabled:opacity-40"
          >
            {added.has(i) ? <Check size={12} /> : <Plus size={12} />} {added.has(i) ? "Added" : "Add extraction"}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ============================= Shell ============================= */
export function AiAssistantModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<AiMode>("build");
  return (
    <Modal title="AI Assistant" onClose={onClose} width={640}>
      <CapabilityGate
        capability="ai-assist"
        label="AI Assistant"
        description="Build requests from plain English, auto-fix failing tests, and generate test cases with AI."
      >
        <div className="mb-3.5 flex flex-wrap gap-1.5">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-[7px] text-xs font-semibold"
                style={{ background: isActive ? "var(--primary-dim)" : "var(--card)", color: isActive ? "var(--primary)" : "var(--text-dim)" }}
              >
                <Icon size={13} /> {m.label}
              </button>
            );
          })}
        </div>
        {mode === "build" && <BuildRequestMode />}
        {mode === "fix" && <FixTestMode />}
        {mode === "tests" && <GenerateTestsMode />}
        {mode === "explain" && <ExplainMode />}
        {mode === "chain" && <ChainMode />}
      </CapabilityGate>
    </Modal>
  );
}
