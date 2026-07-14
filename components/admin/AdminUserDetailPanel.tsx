"use client";

import { useEffect } from "react";
import { X, Sparkles, Ban, RotateCcw, BadgeCheck, CircleAlert, Shield } from "lucide-react";
import type { AdminUserDetail } from "@/hooks/use-admin-panel";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === "active" || status === "authenticated"
      ? "var(--success)"
      : status === "cancelled" || status === "halted"
        ? "var(--danger)"
        : "var(--warning)";
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-[3px] text-[11px] font-semibold capitalize"
      style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      {status}
    </span>
  );
}

type Props = {
  detail: AdminUserDetail | null;
  loading: boolean;
  actionPending: boolean;
  onClose: () => void;
  onGrantPro: (userId: string) => void;
  onRevokePro: (userId: string) => void;
  onResetUsage: (userId: string, type: "executions" | "ai-calls" | "all") => void;
};

export default function AdminUserDetailPanel({ detail, loading, actionPending, onClose, onGrantPro, onRevokePro, onResetUsage }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isPro = detail?.entitlements.plan === "pro";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="m-4 flex max-h-[85vh] w-[560px] max-w-[calc(100vw-32px)] flex-col rounded-[18px] border border-[var(--border)] bg-[var(--bg-elev)] shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-[18px] py-3.5">
          <span className="text-[14.5px] font-bold">User details</span>
          <button
            onClick={onClose}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-[18px]">
          {loading || !detail ? (
            <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
          ) : (
            <>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[16px] font-bold">{detail.user.name}</h3>
                    {detail.user.role === "admin" && (
                      <span className="flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2 py-[3px] text-[10.5px] font-bold text-[var(--primary)]">
                        <Shield size={11} /> Admin
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-[var(--text-dim)]">
                    {detail.user.emailVerified ? (
                      <BadgeCheck size={13} className="flex-shrink-0 text-[var(--success)]" />
                    ) : (
                      <CircleAlert size={13} className="flex-shrink-0 text-[var(--warning)]" />
                    )}
                    {detail.user.email}
                  </div>
                  <div className="mt-1 text-[11.5px] text-[var(--text-faint)]">Joined {formatDate(detail.user.createdAt)}</div>
                </div>

                {isPro ? (
                  <button
                    onClick={() => onRevokePro(detail.user.id)}
                    disabled={actionPending}
                    className="flex h-8 flex-shrink-0 items-center gap-1.5 rounded-[8px] border border-[var(--danger)] px-3 text-[12px] font-semibold text-[var(--danger)] transition-opacity duration-150 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Ban size={13} /> Revoke Pro
                  </button>
                ) : (
                  <button
                    onClick={() => onGrantPro(detail.user.id)}
                    disabled={actionPending}
                    className="flex h-8 flex-shrink-0 items-center gap-1.5 rounded-[8px] bg-[var(--primary)] px-3 text-[12px] font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Sparkles size={13} /> Grant Pro
                  </button>
                )}
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-[10px] border border-[var(--border)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-semibold text-[var(--text-dim)]">Executions this period</span>
                    <button
                      onClick={() => onResetUsage(detail.user.id, "executions")}
                      disabled={actionPending}
                      title="Reset executions"
                      className="text-[var(--text-faint)] transition-colors duration-150 hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <RotateCcw size={13} />
                    </button>
                  </div>
                  <div className="mt-1 text-[18px] font-bold">{(detail.entitlements.usage["executions"] ?? 0).toLocaleString()}</div>
                </div>
                <div className="rounded-[10px] border border-[var(--border)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-semibold text-[var(--text-dim)]">AI calls this period</span>
                    <button
                      onClick={() => onResetUsage(detail.user.id, "ai-calls")}
                      disabled={actionPending}
                      title="Reset AI calls"
                      className="text-[var(--text-faint)] transition-colors duration-150 hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <RotateCcw size={13} />
                    </button>
                  </div>
                  <div className="mt-1 text-[18px] font-bold">{(detail.entitlements.usage["ai-calls"] ?? 0).toLocaleString()}</div>
                </div>
              </div>

              <h4 className="mb-2 text-[12.5px] font-semibold text-[var(--text-dim)]">Subscription history</h4>
              {detail.subscriptions.length === 0 ? (
                <p className="rounded-[10px] border border-dashed border-[var(--border)] p-4 text-center text-[12.5px] text-[var(--text-faint)]">
                  No subscriptions — always on the Free plan.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {detail.subscriptions.map((s) => (
                    <div key={s.id} className="rounded-[10px] border border-[var(--border)] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-[family-name:var(--font-mono)] text-[11.5px] text-[var(--text-dim)]">{s.id}</span>
                        <StatusPill status={s.status} />
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11.5px] text-[var(--text-faint)]">
                        <span className="capitalize">{s.billingCycle}</span>
                        <span>Created {formatDate(s.createdAt)}</span>
                        {s.currentPeriodEnd && <span>Renews {formatDate(s.currentPeriodEnd)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
