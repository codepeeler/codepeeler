"use client";

import { useState } from "react";
import { Ticket, Plus, Trash2 } from "lucide-react";
import type { Coupon } from "@/hooks/use-admin-coupons";

type Props = {
  coupons: Coupon[];
  loading: boolean;
  pending: boolean;
  onCreate: (input: { code: string; description: string; extraTrialDays: number; maxRedemptions: number | null }) => void;
  onToggle: (code: string, active: boolean) => void;
  onDelete: (code: string) => void;
};

export default function AdminCouponsPanel({ coupons, loading, pending, onCreate, onToggle, onDelete }: Props) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [extraTrialDays, setExtraTrialDays] = useState(7);
  const [maxRedemptions, setMaxRedemptions] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[10px] border border-dashed border-[var(--warning)]/40 bg-[var(--warning)]/5 p-3 text-[11.5px] text-[var(--text-dim)]">
        Coupons here extend the trial by N days rather than discounting price — a real % / flat-amount discount on a
        live Razorpay subscription needs a Razorpay &quot;Offer&quot; set up on their side first. Ask if you want that added.
      </div>

      <div className="rounded-[14px] border border-[var(--border)] p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold">
          <Plus size={14} /> New coupon
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CODE"
            className="h-8 rounded-[7px] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[12.5px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
          <input
            type="number"
            min={0}
            value={extraTrialDays}
            onChange={(e) => setExtraTrialDays(Number(e.target.value))}
            placeholder="Extra trial days"
            className="h-8 rounded-[7px] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[12.5px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
          <input
            type="number"
            min={0}
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            placeholder="Max uses (blank = ∞)"
            className="h-8 rounded-[7px] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[12.5px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="h-8 rounded-[7px] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[12.5px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
        </div>
        <button
          onClick={() => {
            if (!code.trim()) return;
            onCreate({
              code,
              description,
              extraTrialDays,
              maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
            });
            setCode("");
            setDescription("");
            setExtraTrialDays(7);
            setMaxRedemptions("");
          }}
          disabled={pending || !code.trim()}
          className="mt-2 h-8 rounded-[7px] bg-[var(--primary)] px-3 text-[12px] font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Create coupon
        </button>
      </div>

      <div className="rounded-[14px] border border-[var(--border)]">
        <div className="flex items-center gap-1.5 border-b border-[var(--border-soft)] px-4 py-3">
          <Ticket size={14} className="text-[var(--text-faint)]" />
          <h3 className="text-[13px] font-semibold">Coupons</h3>
        </div>
        {loading ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
        ) : coupons.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">No coupons yet.</div>
        ) : (
          <div className="divide-y divide-[var(--border-soft)]">
            {coupons.map((c) => (
              <div key={c.code} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="font-[family-name:var(--font-mono)] text-[12.5px] font-semibold">{c.code}</div>
                  <div className="text-[11.5px] text-[var(--text-faint)]">
                    +{c.extraTrialDays}d trial · used {c.timesRedeemed}
                    {c.maxRedemptions !== null ? `/${c.maxRedemptions}` : ""}
                    {c.description ? ` · ${c.description}` : ""}
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <button
                    onClick={() => onToggle(c.code, !c.active)}
                    disabled={pending}
                    className={`h-6 rounded-full px-1 transition-colors ${c.active ? "bg-[var(--success)]" : "bg-[var(--border)]"}`}
                    style={{ width: 38 }}
                  >
                    <span
                      className="block h-4 w-4 rounded-full bg-white shadow transition-transform"
                      style={{ transform: c.active ? "translateX(16px)" : "translateX(0)" }}
                    />
                  </button>
                  <button
                    onClick={() => onDelete(c.code)}
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
