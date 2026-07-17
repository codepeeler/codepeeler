"use client";

import { useState } from "react";
import { ShieldCheck, Plus, UserMinus } from "lucide-react";
import type { AdminAccount } from "@/hooks/use-admin-accounts";

type Props = {
  admins: AdminAccount[];
  loading: boolean;
  saving: boolean;
  onPromote: (email: string) => Promise<void>;
  onDemote: (id: string) => void;
};

export default function AdminAccountsPanel({ admins, loading, saving, onPromote, onDemote }: Props) {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await onPromote(email.trim());
    setEmail("");
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex gap-2 rounded-[14px] border border-[var(--border)] p-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="flex-1 rounded-[8px] border border-[var(--border)] bg-transparent px-3 py-2 text-[12.5px] outline-none focus:border-[var(--primary)]"
        />
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-1.5 rounded-[8px] bg-[var(--primary)] px-3 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
        >
          <Plus size={14} />
          Make admin
        </button>
      </form>

      <div className="rounded-[14px] border border-[var(--border)]">
        <div className="flex items-center gap-1.5 border-b border-[var(--border-soft)] px-4 py-3">
          <ShieldCheck size={14} className="text-[var(--text-faint)]" />
          <h3 className="text-[13px] font-semibold">Admin accounts ({admins.length})</h3>
        </div>

        {loading ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
        ) : admins.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">No admin accounts.</div>
        ) : (
          <div className="divide-y divide-[var(--border-soft)]">
            {admins.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold">{a.name}</div>
                  <div className="text-[11.5px] text-[var(--text-dim)]">{a.email}</div>
                </div>
                <button
                  onClick={() => onDemote(a.id)}
                  className="flex flex-shrink-0 items-center gap-1 rounded-[7px] border border-[var(--border)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--danger)] hover:bg-[var(--danger-dim)]"
                >
                  <UserMinus size={12} />
                  Demote
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
