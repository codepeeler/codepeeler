"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Copy, Loader2, Send, AlertTriangle, Check, X, Plus, Trash2, Save, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes, formatMs, statusClass, statusText, uid } from "@/lib/api-tester/engine";
import { useApiTester } from "@/providers/api-tester-provider";
import type { ApiResponse, RespTabKey, TestResult } from "@/lib/api-tester/types";

/* ---------------- JSON tree ---------------- */
function JsonNode({ k, v, depth, isLast }: { k?: string | number; v: unknown; depth: number; isLast: boolean }) {
  const [open, setOpen] = useState(depth < 2);
  const indent = depth * 16;
  const comma = isLast ? "" : ",";
  const keyEl = k !== undefined ? (
    <>
      <span className="font-[family-name:var(--font-mono)] text-[var(--secondary)]">&quot;{k}&quot;</span>
      <span className="text-[var(--text-faint)]">: </span>
    </>
  ) : null;

  if (v === null) return <div className="flex" style={{ paddingLeft: indent + 14 }}>{keyEl}<span className="font-[family-name:var(--font-mono)] italic text-[var(--text-faint)]">null{comma}</span></div>;
  if (typeof v === "string") return <div className="flex" style={{ paddingLeft: indent + 14 }}>{keyEl}<span className="font-[family-name:var(--font-mono)] text-[var(--cat-gen)]">&quot;{v}&quot;</span><span className="text-[var(--text-faint)]">{comma}</span></div>;
  if (typeof v === "number") return <div className="flex" style={{ paddingLeft: indent + 14 }}>{keyEl}<span className="font-[family-name:var(--font-mono)] text-[var(--warning)]">{v}{comma}</span></div>;
  if (typeof v === "boolean") return <div className="flex" style={{ paddingLeft: indent + 14 }}>{keyEl}<span className="font-[family-name:var(--font-mono)] text-[#A78BFA]">{String(v)}{comma}</span></div>;

  const isArr = Array.isArray(v);
  const entries: [string | number, unknown][] = isArr
    ? (v as unknown[]).map((x, i): [number, unknown] => [i, x])
    : Object.entries(v as Record<string, unknown>);
  const openBr = isArr ? "[" : "{";
  const closeBr = isArr ? "]" : "}";
  if (!entries.length) {
    return <div className="flex" style={{ paddingLeft: indent + 14 }}>{keyEl}<span className="font-[family-name:var(--font-mono)] text-[var(--text-faint)]">{openBr}{closeBr}{comma}</span></div>;
  }
  return (
    <div>
      <div className="flex items-start" style={{ paddingLeft: indent }}>
        <span className="flex h-[18px] w-[14px] flex-shrink-0 cursor-pointer select-none items-center justify-center text-[var(--text-faint)]" onClick={() => setOpen(!open)}>
          {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        </span>
        {keyEl}
        <span className="font-[family-name:var(--font-mono)] text-[var(--text-faint)]">{openBr}</span>
        {!open && <span className="ml-1 font-[family-name:var(--font-mono)] text-[var(--text-faint)]">{entries.length} {isArr ? "items" : "keys"}{closeBr}{comma}</span>}
      </div>
      {open && entries.map(([kk, vv], i) => <JsonNode key={kk} k={isArr ? undefined : kk} v={vv} depth={depth + 1} isLast={i === entries.length - 1} />)}
      {open && <div className="flex font-[family-name:var(--font-mono)] text-[var(--text-faint)]" style={{ paddingLeft: indent + 14 }}>{closeBr}{comma}</div>}
    </div>
  );
}
function JsonTree({ data }: { data: unknown }) {
  return <div className="px-1 py-2.5 text-[12.5px] leading-[1.7]"><JsonNode v={data} depth={0} isLast /></div>;
}
function tryParseJSON(text: string): { ok: boolean; data?: unknown } {
  try { return { ok: true, data: JSON.parse(text) }; } catch { return { ok: false }; }
}

function PrettyView({ response }: { response: ApiResponse }) {
  const parsed = useMemo(() => tryParseJSON(response.bodyText), [response.bodyText]);
  if (parsed.ok) return <JsonTree data={parsed.data} />;
  return (
    <pre className="whitespace-pre-wrap break-words p-3.5 font-[family-name:var(--font-mono)] text-[12.5px]">
      {response.bodyText || <span className="text-[var(--text-faint)]">Empty response body</span>}
    </pre>
  );
}
function RawView({ response }: { response: ApiResponse }) {
  return <pre className="whitespace-pre-wrap break-words p-3.5 font-[family-name:var(--font-mono)] text-[12.5px]">{response.bodyText}</pre>;
}
function PreviewView({ response }: { response: ApiResponse }) {
  const ct = response.headers["content-type"] || "";
  if (ct.includes("text/html")) {
    return <iframe title="preview" sandbox="" srcDoc={response.bodyText} className="h-full w-full border-none bg-white" />;
  }
  if (ct.includes("image/")) {
    return (
      <div className="flex justify-center p-5">
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic data: URI built from response bytes; next/image can't optimize inline base64 content */}
        <img alt="response" src={`data:${ct};base64,${btoa(unescape(encodeURIComponent(response.bodyText)))}`} className="max-w-full rounded-lg" />
      </div>
    );
  }
  return <div className="p-5 text-[12.5px] text-[var(--text-faint)]">Preview isn&apos;t available for this content type ({ct || "unknown"}). Try Pretty or Raw.</div>;
}
function HeadersView({ headers }: { headers: Record<string, string> }) {
  const entries = Object.entries(headers || {});
  if (!entries.length) {
    return <div className="p-5 text-[12.5px] text-[var(--text-faint)]">No headers exposed. Cross-origin responses only expose a limited header set unless the server sends Access-Control-Expose-Headers.</div>;
  }
  return (
    <div className="px-3.5 py-2">
      {entries.map(([k, v]) => (
        <div key={k} className="flex gap-2.5 border-b border-[var(--border-soft)] py-1.5 text-[12.5px]">
          <span className="min-w-[200px] font-[family-name:var(--font-mono)] font-semibold text-[var(--secondary)]">{k}</span>
          <span className="break-all font-[family-name:var(--font-mono)] text-[var(--text-dim)]">{v}</span>
        </div>
      ))}
    </div>
  );
}
function CookiesView() {
  const { cookies, setCookies, activeTab } = useApiTester();
  const host = useMemo(() => { try { return activeTab?.request.url ? new URL(activeTab.request.url.replace(/\{\{.*?\}\}/g, "x")).hostname : ""; } catch { return ""; } }, [activeTab]);

  const addCookie = () => setCookies((prev) => [...prev, { id: uid(), domain: host || "example.com", name: "", value: "", enabled: true }]);
  const update = (id: string, patch: Partial<(typeof cookies)[number]>) => setCookies((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id: string) => setCookies((prev) => prev.filter((c) => c.id !== id));

  return (
    <div className="p-3.5">
      <div className="mb-3 rounded-lg bg-[var(--bg-elev)] p-2.5 text-[11px] leading-[1.6] text-[var(--text-faint)]">
        Browsers block JavaScript from reading a response&apos;s <span className="font-[family-name:var(--font-mono)]">Set-Cookie</span> header. This jar works around that: cookies you add here are sent as a <span className="font-[family-name:var(--font-mono)]">Cookie</span> header on any request whose domain matches, so you can simulate session cookies manually.
      </div>
      <div className="mb-2 grid grid-cols-[1fr_1fr_1fr_26px_30px] gap-1.5 px-1 text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--text-faint)]">
        <span>Domain</span><span>Name</span><span>Value</span><span /><span />
      </div>
      {cookies.length === 0 && <div className="px-1 pb-2 text-[12px] text-[var(--text-faint)]">No stored cookies yet.</div>}
      {cookies.map((c) => (
        <div key={c.id} className="mb-1 grid grid-cols-[1fr_1fr_1fr_26px_30px] items-center gap-1.5">
          <input className="rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-1.5 py-1 font-[family-name:var(--font-mono)] text-[11.5px]" value={c.domain} onChange={(e) => update(c.id, { domain: e.target.value })} placeholder="example.com" />
          <input className="rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-1.5 py-1 font-[family-name:var(--font-mono)] text-[11.5px]" value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} placeholder="session_id" />
          <input className="rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-1.5 py-1 font-[family-name:var(--font-mono)] text-[11.5px]" value={c.value} onChange={(e) => update(c.id, { value: e.target.value })} placeholder="value" />
          <input type="checkbox" className="h-3.5 w-3.5 accent-[var(--primary)]" checked={c.enabled} onChange={(e) => update(c.id, { enabled: e.target.checked })} />
          <button className="flex h-6 w-6 items-center justify-center rounded-lg text-[var(--text-dim)] hover:text-[var(--danger)]" onClick={() => remove(c.id)}><Trash2 size={13} /></button>
        </div>
      ))}
      <button onClick={addCookie} className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]">
        <Plus size={12} /> Add cookie
      </button>
    </div>
  );
}

function DiffView({ prev, next }: { prev: ApiResponse; next: ApiResponse }) {
  const { responseDiff } = useApiTester();
  if (!responseDiff) return <div className="p-5 text-[12.5px] text-[var(--text-faint)]">Both responses need to be valid JSON to compute a diff.</div>;
  if (!responseDiff.length) return <div className="p-5 text-[12.5px] text-[var(--text-faint)]">No differences from the previous response.</div>;
  return (
    <div className="px-3.5 py-2.5">
      <div className="mb-2.5 text-[11px] text-[var(--text-faint)]">Comparing this response against the one before it on this tab ({prev.status} → {next.status}).</div>
      {responseDiff.map((d, i) => (
        <div key={i} className="mb-1.5 rounded-lg border border-[var(--border-soft)] px-2.5 py-2">
          <div className="mb-1 font-[family-name:var(--font-mono)] text-[11.5px] font-semibold text-[var(--secondary)]">{d.path}</div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase"
              style={{
                background: d.kind === "added" ? "var(--success-dim)" : d.kind === "removed" ? "var(--danger-dim)" : "var(--warning-dim)",
                color: d.kind === "added" ? "var(--success)" : d.kind === "removed" ? "var(--danger)" : "var(--warning)",
              }}
            >
              {d.kind}
            </span>
            {d.kind !== "added" && <span className="font-[family-name:var(--font-mono)] text-[var(--danger)] line-through">{JSON.stringify(d.left)}</span>}
            {d.kind !== "removed" && <span className="font-[family-name:var(--font-mono)] text-[var(--success)]">{JSON.stringify(d.right)}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExtractVariableBar() {
  const { saveResponseValueAsVariable } = useApiTester();
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState("");
  const [varName, setVarName] = useState("");
  const [scope, setScope] = useState<"env" | "global">("env");

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]">
        <Save size={12} /> Save value as variable
      </button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] p-2">
      <input className="w-[150px] rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 font-[family-name:var(--font-mono)] text-[11.5px]" placeholder="data.token" value={path} onChange={(e) => setPath(e.target.value)} />
      <span className="text-[11px] text-[var(--text-faint)]">as</span>
      <input className="w-[110px] rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 font-[family-name:var(--font-mono)] text-[11.5px]" placeholder="token" value={varName} onChange={(e) => setVarName(e.target.value)} />
      <select className="rounded-md border border-[var(--border)] bg-[var(--card)] px-1.5 py-1 text-[11.5px]" value={scope} onChange={(e) => setScope(e.target.value as "env" | "global")}>
        <option value="env">Environment</option>
        <option value="global">Global</option>
      </select>
      <button
        onClick={() => { saveResponseValueAsVariable(path, varName, scope); setOpen(false); setPath(""); setVarName(""); }}
        className="rounded-md bg-[var(--primary-dim)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--primary)]"
      >
        Save
      </button>
      <button onClick={() => setOpen(false)} className="rounded-md px-2 py-1 text-[11.5px] text-[var(--text-faint)]">Cancel</button>
    </div>
  );
}

function SaveAsMockBar() {
  const { mockServers, addMockServer, saveResponseAsMock } = useApiTester();
  const [open, setOpen] = useState(false);
  const [serverId, setServerId] = useState("");

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); setServerId(mockServers[0]?.id || ""); }} className="flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]">
        <Radio size={12} /> Save as mock
      </button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] p-2">
      <select className="rounded-md border border-[var(--border)] bg-[var(--card)] px-1.5 py-1 text-[11.5px]" value={serverId} onChange={(e) => setServerId(e.target.value)}>
        <option value="" disabled>Choose a mock server…</option>
        {mockServers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <button onClick={() => setServerId(addMockServer())} className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[11px] font-semibold text-[var(--text-dim)]">+ New</button>
      <button
        disabled={!serverId}
        onClick={() => { saveResponseAsMock(serverId); setOpen(false); }}
        className="rounded-md bg-[var(--primary-dim)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--primary)] disabled:opacity-40"
      >
        Save
      </button>
      <button onClick={() => setOpen(false)} className="rounded-md px-2 py-1 text-[11.5px] text-[var(--text-faint)]">Cancel</button>
    </div>
  );
}
function TestsView({ testResults }: { testResults: TestResult[] | null }) {
  if (!testResults) return <div className="p-5 text-[12.5px] text-[var(--text-faint)]">No test script ran for this response.</div>;
  const passed = testResults.filter((t) => t.pass).length;
  return (
    <div className="px-3.5 py-2.5">
      <div className="mb-2.5 flex items-center gap-2">
        <span
          className="rounded-md px-1.5 py-0.5 text-[10.5px] font-bold"
          style={{ background: passed === testResults.length ? "var(--success-dim)" : "var(--danger-dim)", color: passed === testResults.length ? "var(--success)" : "var(--danger)" }}
        >
          {passed}/{testResults.length} passed
        </span>
      </div>
      {testResults.map((t, i) => (
        <div key={i} className="flex items-start gap-2 border-b border-[var(--border-soft)] py-1.5">
          {t.pass ? <Check size={14} strokeWidth={2.6} className="mt-0.5 text-[var(--success)]" /> : <X size={14} strokeWidth={2.6} className="mt-0.5 text-[var(--danger)]" />}
          <div>
            <div className="text-[12.5px] font-semibold">{t.name}</div>
            {!t.pass && <div className="mt-0.5 font-[family-name:var(--font-mono)] text-[11.5px] text-[var(--danger)]">{t.error}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

const RESPONSE_TABS: { key: RespTabKey; label: string }[] = [
  { key: "pretty", label: "Pretty" },
  { key: "raw", label: "Raw" },
  { key: "preview", label: "Preview" },
  { key: "headers", label: "Headers" },
  { key: "cookies", label: "Cookies" },
  { key: "tests", label: "Tests" },
  { key: "diff", label: "Diff" },
];

export default function ResponsePanel() {
  const { activeTab, setRespTab, toast } = useApiTester();
  if (!activeTab) return null;
  const { response, error, isSending, testResults, respTab, previousResponse } = activeTab;

  if (isSending) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2.5 text-[var(--text-faint)]">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-[12.5px]">Sending request…</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2.5 p-8 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--danger-dim)]">
          <AlertTriangle size={20} className="text-[var(--danger)]" />
        </div>
        <div className="text-[13px] font-bold">Request failed</div>
        <div className="max-w-[380px] text-[12px] leading-[1.6] text-[var(--text-dim)]">{error.message}</div>
      </div>
    );
  }
  if (!response) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--text-faint)]">
        <Send size={26} />
        <div className="text-[12.5px]">Hit Send to see the response here</div>
      </div>
    );
  }

  const headerCount = Object.keys(response.headers || {}).length;
  const testSummary = testResults ? `${testResults.filter((t) => t.pass).length}/${testResults.length}` : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-1 px-2.5 py-1.5">
        {RESPONSE_TABS.filter((t) => t.key !== "diff" || previousResponse).map((t) => (
          <button
            key={t.key}
            onClick={() => setRespTab(t.key)}
            className={cn("rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-[var(--text-faint)]",
              respTab === t.key && "bg-[var(--card)] text-[var(--text)] shadow-[inset_0_0_0_1px_var(--border)]")}
          >
            {t.label}
            {t.key === "headers" && headerCount > 0 ? ` (${headerCount})` : ""}
            {t.key === "tests" && testSummary ? ` (${testSummary})` : ""}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3.5 pr-1.5 text-xs font-bold">
          <span className={statusClass(response.status)}>{response.status} {statusText(response.status) || response.statusText}</span>
          {response.viaProxy && (
            <span className="rounded-md bg-[var(--secondary-dim)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--secondary)]" title="Direct browser request was blocked (usually CORS) — this response came back through the server-side proxy instead.">
              via proxy
            </span>
          )}
          <span className="font-medium text-[var(--text-faint)]">{formatMs(response.duration)}</span>
          <span className="font-medium text-[var(--text-faint)]">{formatBytes(response.size)}</span>
          <button
            className="flex h-[26px] w-[26px] items-center justify-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
            onClick={() => { navigator.clipboard?.writeText(response.bodyText); toast("Response copied"); }}
            title="Copy body"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>
      {respTab === "pretty" && (
        <div className="flex justify-end gap-1.5 px-2.5 pb-1.5">
          <SaveAsMockBar />
          <ExtractVariableBar />
        </div>
      )}
      <div className="h-px flex-shrink-0 bg-[var(--border-soft)]" />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {respTab === "pretty" && <PrettyView response={response} />}
        {respTab === "raw" && <RawView response={response} />}
        {respTab === "preview" && <PreviewView response={response} />}
        {respTab === "headers" && <HeadersView headers={response.headers} />}
        {respTab === "cookies" && <CookiesView />}
        {respTab === "tests" && <TestsView testResults={testResults} />}
        {respTab === "diff" && previousResponse && <DiffView prev={previousResponse} next={response} />}
      </div>
    </div>
  );
}
