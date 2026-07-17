"use client";

import { useState } from "react";
import { RotateCcw, Plus } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import type { RefundRequest } from "@/hooks/use-admin-refunds";

const STATUS_OPTIONS: RefundRequest["status"][] = ["pending", "approved", "rejected", "processed"];

const STATUS_COLORS: Record<RefundRequest["status"], string> = {
  pending: "text-[var(--warning)] bg-[var(--warning-dim)]",
  approved: "text-[var(--primary)] bg-[var(--primary)]/15",
  rejected: "text-[var(--danger)] bg-[var(--danger-dim)]",
  processed: "text-[var(--success)] bg-[var(--success-dim)]",
};

type Props = {
  refunds: RefundRequest[];
  loading: boolean;
  saving: boolean;
  onCreate: (input: { email: string; subscriptionId?: string; amount?: number; reason?: string }) => Promise<void>;
  onUpdateStatus: (id: string, status: RefundRequest["status"]) => void;
};

export default function AdminRefundsPanel({ refunds, loading, saving, onCreate, onUpdateStatus }: Props) {
  const [email, setEmail] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await onCreate({ email: email.trim(), subscriptionId: subscriptionId.trim() || undefined, reason: reason.trim() || undefined });
    setEmail("");
    setSubscriptionId("");
    setReason("");
  };

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-2 rounded-[14px] border border-[var(--border)] p-4 sm:grid-cols-4"
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="User email"
          className="rounded-[8px] border border-[var(--border)] bg-transparent px-3 py-2 text-[12.5px] outline-none focus:border-[var(--primary)]"
        />
        <input
          value={subscriptionId}
          onChange={(e) => setSubscriptionId(e.target.value)}
          placeholder="Subscription id (optional)"
          className="rounded-[8px] border border-[var(--border)] bg-transparent px-3 py-2 text-[12.5px] outline-none focus:border-[var(--primary)]"
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="rounded-[8px] border border-[var(--border)] bg-transparent px-3 py-2 text-[12.5px] outline-none focus:border-[var(--primary)]"
        />
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-1.5 rounded-[8px] bg-[var(--primary)] px-3 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
        >
          <Plus size={14} />
          Log request
        </button>
      </form>

      <div className="rounded-[14px] border border-[var(--border)]">
        <div className="flex items-center gap-1.5 border-b border-[var(--border-soft)] px-4 py-3">
          <RotateCcw size={14} className="text-[var(--text-faint)]" />
          <h3 className="text-[13px] font-semibold">Refund requests</h3>
        </div>

        {loading ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
        ) : refunds.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">No refund requests logged yet.</div>
        ) : (
          <div className="divide-y divide-[var(--border-soft)]">
            {refunds.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold">{r.user?.name ?? "Unknown user"}</div>
                  <div className="text-[11.5px] text-[var(--text-dim)]">{r.user?.email}</div>
                  {r.reason && <div className="mt-1 text-[11.5px] text-[var(--text-faint)]">{r.reason}</div>}
                  <div className="mt-1 text-[10.5px] text-[var(--text-faint)]">{formatTimeAgo(r.createdAt)}</div>
                </div>
                <select
                  value={r.status}
                  onChange={(e) => onUpdateStatus(r.id, e.target.value as RefundRequest["status"])}
                  className={`flex-shrink-0 rounded-[6px] border-0 px-2 py-1 text-[11px] font-semibold outline-none ${STATUS_COLORS[r.status]}`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
