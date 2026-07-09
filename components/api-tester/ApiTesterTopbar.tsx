"use client";

import { useState } from "react";
import { Plus, X, Send, Save, Code2, MoreVertical, Copy, Upload, Loader2 } from "lucide-react";
import { useApiTester } from "@/providers/api-tester-provider";
import { HTTP_METHODS } from "@/lib/api-tester/types";

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
          <span className="flex-shrink-0 font-[family-name:var(--font-mono)] text-[10px] font-extrabold" style={{ color: `var(--${t.request.method.toLowerCase()})` }}>
            {t.request.method}
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

/* ============================= URL bar ============================= */
export function UrlBar({ onOpenCode, onOpenSave }: { onOpenCode: () => void; onOpenSave: () => void }) {
  const { activeTab, updateRequest, send, cancel, duplicateTab } = useApiTester();
  const [moreOpen, setMoreOpen] = useState(false);
  if (!activeTab) return null;
  const req = activeTab.request;

  return (
    <div className="flex flex-col gap-2 p-2.5 px-4 lg:flex-row lg:items-center">
      <div className="flex items-center gap-2">
        <select
          value={req.method}
          onChange={(e) => updateRequest({ method: e.target.value as any })}
          className="w-[92px] flex-shrink-0 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px] font-extrabold lg:w-[108px]"
          style={{ color: `var(--${req.method.toLowerCase()})` }}
        >
          {HTTP_METHODS.map((m) => <option key={m} value={m} className="text-[var(--text)]">{m}</option>)}
        </select>
        <input
          value={req.url}
          onChange={(e) => updateRequest({ url: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="https://api.example.com/endpoint?param={{value}}"
          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[7px] font-[family-name:var(--font-mono)] text-[13px] focus:border-[var(--primary)]"
        />
      </div>
      <div className="flex items-center gap-2">
        {activeTab.isSending ? (
          <button onClick={cancel} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--danger-dim)] px-3 py-[7px] text-xs font-semibold text-[var(--danger)] lg:flex-initial">
            <Loader2 size={13} className="animate-spin" /> Cancel
          </button>
        ) : (
          <button onClick={send} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,var(--primary),#7C4CF0)] px-3 py-[7px] text-xs font-semibold text-white hover:brightness-[1.08] hover:shadow-[var(--shadow-glow)] lg:flex-initial">
            <Send size={13} /> Send
          </button>
        )}
        <button onClick={onOpenSave} className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-[7px] text-xs font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]">
          <Save size={13} /> <span className="hidden sm:inline lg:inline">Save</span>
        </button>
        <button onClick={onOpenCode} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]">
          <Code2 size={13} />
        </button>
        <div className="relative flex-shrink-0">
          <button onClick={() => setMoreOpen(!moreOpen)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
