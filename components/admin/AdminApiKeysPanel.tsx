"use client";

import { useState } from "react";
import { KeyRound, Plus, Ban, Copy } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import type { ApiKeyRow } from "@/hooks/use-admin-api-keys";

type Props = {
  keys: ApiKeyRow[];
  loading: boolean;
  saving: boolean;
  onCreate: (label: string) => Promise<void>;
  onRevoke: (id: string) => void;
  justCreatedKey: string | null;
  onClearJustCreated: () => void;
};

export default function AdminApiKeysPanel({ keys, loading, saving, onCreate, onRevoke, justCreatedKey, onClearJustCreated }: Props) {
  const [label, setLabel] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    await onCreate(label.trim());
    setLabel("");
  };

  return (
    <div className="flex flex-col gap-4">
      {justCreatedKey && (
        <div className="rounded-[14px] border border-[var(--primary)] bg-[var(--primary)]/10 p-4">
          <div className="mb-2 text-[12.5px] font-semibold">Copy this key now — it won&apos;t be shown again</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-[7px] bg-[var(--card-hover)] px-2.5 py-1.5 text-[12px]">{justCreatedKey}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(justCreatedKey);
                onClearJustCreated();
              }}
              className="flex flex-shrink-0 items-center gap-1 rounded-[7px] bg-[var(--primary)] px-2.5 py-1.5 text-[11.5px] font-semibold text-white"
            >
              <Copy size={12} />
              Copy & dismiss
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 rounded-[14px] border border-[var(--border)] p-4">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={`Key label (e.g. "Zapier integration")`}
          className="flex-1 rounded-[8px] border border-[var(--border)] bg-transparent px-3 py-2 text-[12.5px] outline-none focus:border-[var(--primary)]"
        />
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-1.5 rounded-[8px] bg-[var(--primary)] px-3 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
        >
          <Plus size={14} />
          Generate key
        </button>
      </form>

      <div className="rounded-[14px] border border-[var(--border)]">
        <div className="flex items-center gap-1.5 border-b border-[var(--border-soft)] px-4 py-3">
          <KeyRound size={14} className="text-[var(--text-faint)]" />
          <h3 className="text-[13px] font-semibold">API keys</h3>
        </div>

        {loading ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
        ) : keys.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">No API keys yet — generate one above.</div>
        ) : (
          <div className="divide-y divide-[var(--border-soft)]">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold">{k.label}</div>
                  <div className="text-[11px] text-[var(--text-faint)]">
                    <code>{k.keyPrefix}…</code> · created {formatTimeAgo(k.createdAt)}
                    {k.lastUsedAt && ` · last used ${formatTimeAgo(k.lastUsedAt)}`}
                  </div>
                </div>
                {k.revoked ? (
                  <span className="flex-shrink-0 rounded-[6px] bg-[var(--card-hover)] px-2 py-1 text-[11px] font-semibold text-[var(--text-faint)]">
                    Revoked
                  </span>
                ) : (
                  <button
                    onClick={() => onRevoke(k.id)}
                    className="flex flex-shrink-0 items-center gap-1 rounded-[7px] border border-[var(--border)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--danger)] hover:bg-[var(--danger-dim)]"
                  >
                    <Ban size={12} />
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
