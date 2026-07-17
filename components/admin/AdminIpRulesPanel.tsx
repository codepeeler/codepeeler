"use client";

import { useState } from "react";
import { Globe2, Plus, Trash2 } from "lucide-react";
import type { IpRule } from "@/hooks/use-admin-ip-rules";

type Props = {
  rules: IpRule[];
  loading: boolean;
  saving: boolean;
  onCreate: (ip: string, type: "block" | "allow", note: string) => Promise<void>;
  onDelete: (id: string) => void;
};

export default function AdminIpRulesPanel({ rules, loading, saving, onCreate, onDelete }: Props) {
  const [ip, setIp] = useState("");
  const [type, setType] = useState<"block" | "allow">("block");
  const [note, setNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip.trim()) return;
    await onCreate(ip.trim(), type, note.trim());
    setIp("");
    setNote("");
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2 rounded-[14px] border border-[var(--border)] p-4 sm:grid-cols-4">
        <input
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="IP address"
          className="rounded-[8px] border border-[var(--border)] bg-transparent px-3 py-2 text-[12.5px] outline-none focus:border-[var(--primary)]"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "block" | "allow")}
          className="rounded-[8px] border border-[var(--border)] bg-transparent px-3 py-2 text-[12.5px] outline-none focus:border-[var(--primary)]"
        >
          <option value="block">Block</option>
          <option value="allow">Allow</option>
        </select>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="rounded-[8px] border border-[var(--border)] bg-transparent px-3 py-2 text-[12.5px] outline-none focus:border-[var(--primary)]"
        />
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-1.5 rounded-[8px] bg-[var(--primary)] px-3 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
        >
          <Plus size={14} />
          Add rule
        </button>
      </form>

      <div className="rounded-[14px] border border-[var(--border)]">
        <div className="flex items-center gap-1.5 border-b border-[var(--border-soft)] px-4 py-3">
          <Globe2 size={14} className="text-[var(--text-faint)]" />
          <h3 className="text-[13px] font-semibold">IP rules</h3>
        </div>

        {loading ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
        ) : rules.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">No IP rules yet — add one above.</div>
        ) : (
          <div className="divide-y divide-[var(--border-soft)]">
            {rules.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[12.5px]">
                    <code className="font-semibold">{r.ip}</code>
                    <span
                      className={`rounded-[5px] px-1.5 py-0.5 text-[10.5px] font-semibold ${
                        r.type === "block" ? "bg-[var(--danger-dim)] text-[var(--danger)]" : "bg-[var(--success-dim)] text-[var(--success)]"
                      }`}
                    >
                      {r.type}
                    </span>
                  </div>
                  {r.note && <div className="text-[11px] text-[var(--text-faint)]">{r.note}</div>}
                </div>
                <button onClick={() => onDelete(r.id)} className="text-[var(--text-faint)] hover:text-[var(--danger)]">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
