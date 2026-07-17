"use client";

import { Wrench, Search, Star, FlaskConical } from "lucide-react";
import type { AdminToolRow } from "@/lib/tool-overrides";

type Props = {
  tools: AdminToolRow[];
  loading: boolean;
  query: string;
  setQuery: (q: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<AdminToolRow, "enabled" | "featured" | "beta">>) => void;
};

export default function AdminToolsPanel({ tools, loading, query, setQuery, onUpdate }: Props) {
  return (
    <div className="rounded-[14px] border border-[var(--border)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-soft)] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Wrench size={14} className="text-[var(--text-faint)]" />
          <h3 className="text-[13px] font-semibold">Tools ({tools.length})</h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-[7px] border border-[var(--border)] px-2 py-1">
          <Search size={12} className="text-[var(--text-faint)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="w-40 bg-transparent text-[11.5px] outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
      ) : (
        <div className="max-h-[560px] divide-y divide-[var(--border-soft)] overflow-y-auto">
          {tools.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-medium">{t.name}</div>
                <div className="text-[11px] text-[var(--text-faint)]">{t.cat}</div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  onClick={() => onUpdate(t.id, { featured: !t.featured })}
                  title="Featured"
                  className={`flex h-6 w-6 items-center justify-center rounded-[6px] ${
                    t.featured ? "bg-[var(--warning-dim)] text-[var(--warning)]" : "text-[var(--text-faint)] hover:bg-[var(--card-hover)]"
                  }`}
                >
                  <Star size={13} fill={t.featured ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => onUpdate(t.id, { beta: !t.beta })}
                  title="Beta"
                  className={`flex h-6 w-6 items-center justify-center rounded-[6px] ${
                    t.beta ? "bg-[var(--primary)]/15 text-[var(--primary)]" : "text-[var(--text-faint)] hover:bg-[var(--card-hover)]"
                  }`}
                >
                  <FlaskConical size={13} />
                </button>
                <button
                  onClick={() => onUpdate(t.id, { enabled: !t.enabled })}
                  className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
                    t.enabled ? "bg-[var(--success)]" : "bg-[var(--border)]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      t.enabled ? "translate-x-[18px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
