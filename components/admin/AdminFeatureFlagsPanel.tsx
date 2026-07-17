"use client";

import { useState } from "react";
import { Flag, Plus, Trash2 } from "lucide-react";
import type { FeatureFlag } from "@/hooks/use-admin-feature-flags";

type Props = {
  flags: FeatureFlag[];
  loading: boolean;
  pending: boolean;
  onCreate: (key: string, description: string) => void;
  onToggle: (key: string, enabled: boolean) => void;
  onDelete: (key: string) => void;
};

export default function AdminFeatureFlagsPanel({ flags, loading, pending, onCreate, onToggle, onDelete }: Props) {
  const [newKey, setNewKey] = useState("");
  const [newDescription, setNewDescription] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[14px] border border-[var(--border)] p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold">
          <Plus size={14} /> New flag
        </h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="flag-key (e.g. new-workflow-builder)"
            className="h-8 flex-1 rounded-[7px] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[12.5px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="What does this control?"
            className="h-8 flex-1 rounded-[7px] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[12.5px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
          <button
            onClick={() => {
              if (!newKey.trim()) return;
              onCreate(newKey, newDescription);
              setNewKey("");
              setNewDescription("");
            }}
            disabled={pending || !newKey.trim()}
            className="h-8 rounded-[7px] bg-[var(--primary)] px-3 text-[12px] font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>

      <div className="rounded-[14px] border border-[var(--border)]">
        <div className="flex items-center gap-1.5 border-b border-[var(--border-soft)] px-4 py-3">
          <Flag size={14} className="text-[var(--text-faint)]" />
          <h3 className="text-[13px] font-semibold">Flags</h3>
        </div>
        {loading ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
        ) : flags.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">No flags yet — add one above.</div>
        ) : (
          <div className="divide-y divide-[var(--border-soft)]">
            {flags.map((f) => (
              <div key={f.key} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="font-[family-name:var(--font-mono)] text-[12.5px] font-semibold">{f.key}</div>
                  {f.description && <div className="text-[11.5px] text-[var(--text-faint)]">{f.description}</div>}
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <button
                    onClick={() => onToggle(f.key, !f.enabled)}
                    disabled={pending}
                    className={`h-6 rounded-full px-1 transition-colors ${f.enabled ? "bg-[var(--success)]" : "bg-[var(--border)]"}`}
                    style={{ width: 38 }}
                  >
                    <span
                      className="block h-4 w-4 rounded-full bg-white shadow transition-transform"
                      style={{ transform: f.enabled ? "translateX(16px)" : "translateX(0)" }}
                    />
                  </button>
                  <button
                    onClick={() => onDelete(f.key)}
                    disabled={pending}
                    className="text-[var(--text-faint)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
