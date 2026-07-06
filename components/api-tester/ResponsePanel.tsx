"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Copy, Loader2, Send, AlertTriangle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes, formatMs, statusClass, statusText } from "@/lib/api-tester/engine";
import { useApiTester } from "@/providers/api-tester-provider";
import type { ApiResponse, RespTabKey, TestResult } from "@/lib/api-tester/types";

/* ---------------- JSON tree ---------------- */
function JsonNode({ k, v, depth, isLast }: { k?: string | number; v: any; depth: number; isLast: boolean }) {
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
  const t = typeof v;
  if (t === "string") return <div className="flex" style={{ paddingLeft: indent + 14 }}>{keyEl}<span className="font-[family-name:var(--font-mono)] text-[var(--cat-gen)]">&quot;{v}&quot;</span><span className="text-[var(--text-faint)]">{comma}</span></div>;
  if (t === "number") return <div className="flex" style={{ paddingLeft: indent + 14 }}>{keyEl}<span className="font-[family-name:var(--font-mono)] text-[var(--warning)]">{v}{comma}</span></div>;
  if (t === "boolean") return <div className="flex" style={{ paddingLeft: indent + 14 }}>{keyEl}<span className="font-[family-name:var(--font-mono)] text-[#A78BFA]">{String(v)}{comma}</span></div>;

  const isArr = Array.isArray(v);
  const entries: [string | number, any][] = isArr ? v.map((x: any, i: number) => [i, x]) : Object.entries(v);
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
function JsonTree({ data }: { data: any }) {
  return <div className="px-1 py-2.5 text-[12.5px] leading-[1.7]"><JsonNode v={data} depth={0} isLast /></div>;
}
function tryParseJSON(text: string): { ok: boolean; data?: any } {
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
  return (
    <div className="p-5 text-[12.5px] leading-[1.6] text-[var(--text-faint)]">
      Browsers block JavaScript from reading the <span className="font-[family-name:var(--font-mono)]">Set-Cookie</span> header for security reasons, even from a same-origin fetch.
      Cookies set by this response are still stored by the browser — check DevTools → Application → Cookies to inspect them.
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
];

export default function ResponsePanel() {
  const { activeTab, setRespTab, toast } = useApiTester();
  if (!activeTab) return null;
  const { response, error, isSending, testResults, respTab } = activeTab;

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
        {RESPONSE_TABS.map((t) => (
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
      <div className="h-px flex-shrink-0 bg-[var(--border-soft)]" />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {respTab === "pretty" && <PrettyView response={response} />}
        {respTab === "raw" && <RawView response={response} />}
        {respTab === "preview" && <PreviewView response={response} />}
        {respTab === "headers" && <HeadersView headers={response.headers} />}
        {respTab === "cookies" && <CookiesView />}
        {respTab === "tests" && <TestsView testResults={testResults} />}
      </div>
    </div>
  );
}
