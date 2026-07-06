"use client";

import { Settings } from "lucide-react";
import { useApiTester } from "@/providers/api-tester-provider";

export default function EnvironmentPanel({ onOpenManager }: { onOpenManager: () => void }) {
  const { environments, activeEnvId, setActiveEnvId, collections, history } = useApiTester();
  const activeEnv = environments.find((e) => e.id === activeEnvId);

  return (
    <aside className="flex w-[292px] flex-shrink-0 flex-col overflow-y-auto border-l border-[var(--border-soft)] bg-[var(--bg-elev)]">
      <div className="p-3.5">
        <div className="mb-2.5 text-sm font-bold">Environment</div>
        <select
          value={activeEnvId || ""}
          onChange={(e) => setActiveEnvId(e.target.value || null)}
          className="mb-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-[7px] font-[family-name:var(--font-mono)] text-[12.5px]"
        >
          <option value="">No Environment</option>
          {environments.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <button
          onClick={onOpenManager}
          className="flex w-full items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-[7px] text-xs font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]"
        >
          <Settings size={13} /> Manage Environments
        </button>
      </div>
      <div className="h-px bg-[var(--border-soft)]" />
      <div className="p-3.5">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-faint)]">
          {activeEnv ? `${activeEnv.variables.length} variable${activeEnv.variables.length === 1 ? "" : "s"}` : "No environment selected"}
        </div>
        {activeEnv?.variables.slice(0, 6).map((v) => (
          <div key={v.id} className="flex justify-between py-[3px] text-xs">
            <span className="font-[family-name:var(--font-mono)] text-[var(--secondary)]">{v.key}</span>
            <span className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap font-[family-name:var(--font-mono)] text-[var(--text-faint)]">
              {v.secret ? "••••••" : v.value}
            </span>
          </div>
        ))}
        {activeEnv && activeEnv.variables.length > 6 && (
          <div className="mt-1 text-[11px] text-[var(--text-faint)]">+{activeEnv.variables.length - 6} more</div>
        )}
      </div>
      <div className="h-px bg-[var(--border-soft)]" />
      <div className="flex-1 p-3.5">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-faint)]">Workspace</div>
        <div className="flex justify-between py-[3px] text-xs text-[var(--text-dim)]"><span>Collections</span><b className="text-[var(--text)]">{collections.length}</b></div>
        <div className="flex justify-between py-[3px] text-xs text-[var(--text-dim)]"><span>Requests sent</span><b className="text-[var(--text)]">{history.length}</b></div>
        <div className="flex justify-between py-[3px] text-xs text-[var(--text-dim)]"><span>Environments</span><b className="text-[var(--text)]">{environments.length}</b></div>
      </div>
      <div className="h-px bg-[var(--border-soft)]" />
      <div className="p-3.5">
        <div className="rounded-xl border border-[var(--border-soft)] p-3" style={{ background: "linear-gradient(160deg, var(--primary-dim), transparent)" }}>
          <div className="mb-1 text-xs font-bold">⌘ Shortcuts</div>
          <div className="space-y-1 text-[11px] text-[var(--text-faint)]">
            <div className="flex justify-between"><span>Send request</span><span className="font-[family-name:var(--font-mono)]">⌘ ↵</span></div>
            <div className="flex justify-between"><span>Save request</span><span className="font-[family-name:var(--font-mono)]">⌘ S</span></div>
            <div className="flex justify-between"><span>New tab</span><span className="font-[family-name:var(--font-mono)]">⌘ T</span></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
