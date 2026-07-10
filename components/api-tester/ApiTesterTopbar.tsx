"use client";

import { useState } from "react";
import { Plus, X, Send, Save, Code2, MoreVertical, Copy, Upload, Loader2, Zap } from "lucide-react";
import { useApiTester } from "@/providers/api-tester-provider";
import { HTTP_METHODS } from "@/lib/api-tester/types";
import type { HttpMethod, RequestProtocol } from "@/lib/api-tester/types";
import { cn } from "@/lib/utils";
import Drawer from "@/components/layout/mobile/Drawer";
import { useMobileShell } from "@/providers/mobile-shell-provider";

/* ============================= Page header ============================= */
export function PageHeader({ onImport }: { onImport: () => void }) {
  const { newTabAction } = useApiTester();
  return (
    <div className="flex flex-wrap items-end justify-between gap-2.5 px-5 pb-1.5 pt-4.5">
      <div>
        <div className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.01em]">API Tester</div>
        <div className="mt-0.5 text-[12.5px] text-[var(--text-faint)]">Test and debug your APIs with powerful features.</div>
      </div>
      <span className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[color-mix(in_srgb,var(--success)_14%,transparent)] py-1 pl-[7px] pr-[9px] text-[11px] font-semibold text-[var(--success)]">
        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />
        Saved locally
      </span>
      <div className="flex gap-2">
        <button onClick={onImport} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-[7px] text-xs font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]">
          <Upload size={13} /> Import
        </button>
        <button onClick={newTabAction} className="flex items-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] px-3 py-[7px] text-xs font-semibold text-white hover:brightness-[1.08] hover:shadow-[var(--shadow-glow)]">
          <Plus size={13} /> New Request
        </button>
      </div>
    </div>
  );
}

/* ============================= Open request tabs ============================= */
export function RequestTabsBar() {
  const { tabs, activeTabId, setActiveTabId, newTabAction, closeTab } = useApiTester();
  return (
    <div className="flex flex-shrink-0 items-center gap-0.5 overflow-x-auto px-4 pt-2">
      {tabs.map((t) => (
        <div
          key={t.id}
          onClick={() => setActiveTabId(t.id)}
          className="flex max-w-[190px] flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-t-[9px] px-2.5 py-2 text-[12.5px]"
          style={{
            background: activeTabId === t.id ? "var(--card)" : "transparent",
            color: activeTabId === t.id ? "var(--text)" : "var(--text-faint)",
            boxShadow: activeTabId === t.id ? "inset 0 0 0 1px var(--border-soft)" : "none",
            borderBottom: `2px solid ${activeTabId === t.id ? "var(--primary)" : "transparent"}`,
          }}
        >
          <span className="flex-shrink-0 font-[family-name:var(--font-mono)] text-[10px] font-extrabold" style={{ color: t.request.protocol === "http" ? `var(--${t.request.method.toLowerCase()})` : "var(--secondary)" }}>
            {t.request.protocol === "websocket" ? "WS" : t.request.protocol === "sse" ? "SSE" : t.request.method}
          </span>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {t.name}
            {!t.saved && <span className="text-[var(--warning)]"> •</span>}
          </span>
          <button
            className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded hover:bg-[var(--card-hover)]"
            onClick={(e) => { e.stopPropagation(); closeTab(t.id); }}
          >
            <X size={11} />
          </button>
        </div>
      ))}
      <button className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]" onClick={newTabAction} title="New tab (Ctrl+T)">
        <Plus size={14} />
      </button>
    </div>
  );
}

const PROTOCOLS: { key: RequestProtocol; label: string }[] = [
  { key: "http", label: "HTTP" },
  { key: "websocket", label: "WS" },
  { key: "sse", label: "SSE" },
];

export const URL_BAR_MORE_PANEL_ID = "url-bar-more";

/* ============================= URL bar ============================= */
export function UrlBar({ onOpenCode, onOpenSave, onOpenLoadTest }: { onOpenCode: () => void; onOpenSave: () => void; onOpenLoadTest: () => void }) {
  const { activeTab, updateRequest, send, cancel, duplicateTab } = useApiTester();
  const [moreOpen, setMoreOpen] = useState(false);
  const { togglePanel, closePanel } = useMobileShell();
  if (!activeTab) return null;
  const req = activeTab.request;
  const isHttp = req.protocol === "http";

  const protocolSwitcher = (
    <div className="flex flex-shrink-0 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-0.5">
      {PROTOCOLS.map((p) => (
        <button
          key={p.key}
          onClick={() => updateRequest({ protocol: p.key })}
          className={cn(
            "rounded-md px-2 py-1 text-[11px] font-bold transition-colors",
            req.protocol === p.key ? "bg-[var(--card)] text-[var(--primary)] shadow-[inset_0_0_0_1px_var(--border)]" : "text-[var(--text-faint)] hover:text-[var(--text)]"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  const methodSelect = isHttp && (
    <select
      value={req.method}
      onChange={(e) => updateRequest({ method: e.target.value as HttpMethod })}
      className="w-[108px] flex-shrink-0 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px] font-extrabold"
      style={{ color: `var(--${req.method.toLowerCase()})` }}
    >
      {HTTP_METHODS.map((m) => <option key={m} value={m} className="text-[var(--text)]">{m}</option>)}
    </select>
  );

  const urlInput = (
    <input
      value={req.url}
      onChange={(e) => updateRequest({ url: e.target.value })}
      onKeyDown={(e) => e.key === "Enter" && isHttp && send()}
      placeholder={isHttp ? "https://api.example.com/endpoint?param={{value}}" : req.protocol === "websocket" ? "wss://echo.example.com/socket" : "https://api.example.com/events"}
      className="w-full flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[13px] focus:border-[var(--primary)]"
    />
  );

  const sendButton = isHttp && (
    activeTab.isSending ? (
      <button onClick={cancel} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--danger-dim)] px-3 py-[7px] text-xs font-semibold text-[var(--danger)] lg:flex-initial">
        <Loader2 size={13} className="animate-spin" /> Cancel
      </button>
    ) : (
      <button onClick={send} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] px-3 py-[7px] text-xs font-semibold text-white hover:brightness-[1.08] hover:shadow-[var(--shadow-glow)] lg:flex-initial">
        <Send size={13} /> Send
      </button>
    )
  );

  const saveButton = (
    <button onClick={onOpenSave} className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-[7px] text-xs font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]">
      <Save size={13} /> Save
    </button>
  );

  const codeButton = isHttp && (
    <button onClick={onOpenCode} className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)] lg:flex">
      <Code2 size={13} />
    </button>
  );

  return (
    <>
      {/* Desktop: original single-row layout, unchanged. */}
      <div className="hidden items-center gap-2 p-2.5 px-4 lg:flex">
        {protocolSwitcher}
        {methodSelect}
        {urlInput}
        {sendButton}
        {saveButton}
        {codeButton}
        <div className="relative">
          <button onClick={() => setMoreOpen(!moreOpen)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]" aria-label="More actions" title="More actions">
            <MoreVertical size={15} />
          </button>
          {moreOpen && (
            <div className="absolute right-0 top-[110%] z-[60] min-w-[170px] rounded-xl border border-[var(--border-soft)] bg-[var(--card)] py-1 shadow-[var(--shadow-soft)]" onMouseLeave={() => setMoreOpen(false)}>
              <button
                className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[12.5px] hover:bg-[var(--card-hover)]"
                onClick={() => { duplicateTab(); setMoreOpen(false); }}
              >
                <Copy size={13} /> Duplicate tab
              </button>
              {isHttp && (
                <button
                  className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[12.5px] hover:bg-[var(--card-hover)]"
                  onClick={() => { onOpenLoadTest(); setMoreOpen(false); }}
                >
                  <Zap size={13} /> Load test this request
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: stacked rows so every control keeps a full-size, labeled touch target — nothing is cropped or squeezed. */}
      <div className="flex flex-col gap-2 p-3 lg:hidden">
        <div className="flex items-center gap-2">
          {protocolSwitcher}
          {methodSelect}
        </div>
        {urlInput}
        <div className="flex items-center gap-2">
          {sendButton}
          {saveButton}
          <button
            onClick={() => togglePanel(URL_BAR_MORE_PANEL_ID)}
            aria-label="More actions"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-dim)]"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Mobile "More actions" — a labeled bottom sheet instead of a cramped floating dropdown. */}
      <Drawer id={URL_BAR_MORE_PANEL_ID} title="More actions" variant="bottom">
        <div className="p-2">
          {isHttp && (
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13.5px] font-medium text-[var(--text)] hover:bg-[var(--card-hover)]"
              onClick={() => { closePanel(); onOpenCode(); }}
            >
              <Code2 size={16} className="text-[var(--text-faint)]" />
              <span>
                View generated code
                <span className="block text-[11.5px] font-normal text-[var(--text-faint)]">Copy this request as curl, fetch, Python & more</span>
              </span>
            </button>
          )}
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13.5px] font-medium text-[var(--text)] hover:bg-[var(--card-hover)]"
            onClick={() => { closePanel(); duplicateTab(); }}
          >
            <Copy size={16} className="text-[var(--text-faint)]" />
            <span>
              Duplicate tab
              <span className="block text-[11.5px] font-normal text-[var(--text-faint)]">Make a copy of this request in a new tab</span>
            </span>
          </button>
          {isHttp && (
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13.5px] font-medium text-[var(--text)] hover:bg-[var(--card-hover)]"
              onClick={() => { closePanel(); onOpenLoadTest(); }}
            >
              <Zap size={16} className="text-[var(--text-faint)]" />
              <span>
                Load test this request
                <span className="block text-[11.5px] font-normal text-[var(--text-faint)]">Send it repeatedly to measure throughput & latency</span>
              </span>
            </button>
          )}
        </div>
      </Drawer>
    </>
  );
}
