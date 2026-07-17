"use client";

import { useEffect, useState } from "react";
import { X, Sparkles, Ban, RotateCcw, BadgeCheck, CircleAlert, Shield, Wrench, Layers, Workflow, Code2, History, Mail, Send } from "lucide-react";
import type { AdminUserDetail, GrantDuration } from "@/hooks/use-admin-panel";
import { ACTIVITY_META } from "@/lib/data/activity";
import { formatTimeAgo } from "@/lib/utils";
import type { ActivityType } from "@/lib/activity";

const DURATION_OPTIONS: { value: GrantDuration; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "1m", label: "1 month" },
  { value: "3m", label: "3 months" },
  { value: "6m", label: "6 months" },
  { value: "1y", label: "1 year" },
  { value: "lifetime", label: "Lifetime (no expiry)" },
];

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
  onGrantPro: (userId: string, duration: GrantDuration) => void;
  onRevokePro: (userId: string) => void;
  onResetUsage: (userId: string, type: "executions" | "ai-calls" | "all") => void;
  onToggleBan: (userId: string, banned: boolean) => void;
  onToggleRole: (userId: string, role: "admin" | "user") => void;
  onSendEmail: (userId: string, subject: string, message: string) => Promise<void>;
};

export default function AdminUserDetailPanel({
  detail,
  loading,
  actionPending,
  onClose,
  onGrantPro,
  onRevokePro,
  onResetUsage,
  onToggleBan,
  onToggleRole,
  onSendEmail,
}: Props) {
  const [showGrantPicker, setShowGrantPicker] = useState(false);
  const [duration, setDuration] = useState<GrantDuration>("1m");

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

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
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[16px] font-bold">{detail.user.name}</h3>
                    {detail.user.role === "admin" && (
                      <span className="flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2 py-[3px] text-[10.5px] font-bold text-[var(--primary)]">
                        <Shield size={11} /> Admin
                      </span>
                    )}
                    {detail.user.banned && (
                      <span className="flex items-center gap-1 rounded-full bg-[var(--danger)]/10 px-2 py-[3px] text-[10.5px] font-bold text-[var(--danger)] animate-pulse">
                        <Ban size={11} /> Banned
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

                <div className="flex flex-col gap-2 min-w-[130px]">
                  {isPro ? (
                    <button
                      onClick={() => onRevokePro(detail.user.id)}
                      disabled={actionPending}
                      className="flex h-8 w-full items-center justify-center gap-1.5 rounded-[8px] border border-[var(--danger)] px-3 text-[12px] font-semibold text-[var(--danger)] transition-opacity duration-150 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Sparkles size={13} /> Revoke Pro
                    </button>
                  ) : showGrantPicker ? (
                    <div className="flex flex-col gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-2">
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value as GrantDuration)}
                        className="h-7 w-full rounded-[6px] border border-[var(--border)] bg-[var(--bg)] px-1.5 text-[11.5px] outline-none focus:border-[var(--primary)]"
                      >
                        {DURATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            onGrantPro(detail.user.id, duration);
                            setShowGrantPicker(false);
                          }}
                          disabled={actionPending}
                          className="h-7 flex-1 rounded-[6px] bg-[var(--primary)] text-[11.5px] font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setShowGrantPicker(false)}
                          disabled={actionPending}
                          className="h-7 flex-1 rounded-[6px] border border-[var(--border)] text-[11.5px] font-semibold text-[var(--text-dim)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowGrantPicker(true)}
                      disabled={actionPending}
                      className="flex h-8 w-full items-center justify-center gap-1.5 rounded-[8px] bg-[var(--primary)] px-3 text-[12px] font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Sparkles size={13} /> Grant Pro
                    </button>
                  )}

                  <button
                    onClick={() => setShowEmailForm((v) => !v)}
                    disabled={actionPending}
                    className="flex h-8 w-full items-center justify-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-semibold text-[var(--text-dim)] hover:text-[var(--text)] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Mail size={13} /> Email user
                  </button>

                  <button
                    onClick={() => onToggleBan(detail.user.id, !detail.user.banned)}
                    disabled={actionPending}
                    className={`flex h-8 w-full items-center justify-center gap-1.5 rounded-[8px] px-3 text-[12px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
                      detail.user.banned
                        ? "bg-[var(--success)] text-white hover:opacity-90"
                        : "border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)]/10"
                    }`}
                  >
                    <Ban size={13} /> {detail.user.banned ? "Unban User" : "Ban User"}
                  </button>

                  <button
                    onClick={() => onToggleRole(detail.user.id, detail.user.role === "admin" ? "user" : "admin")}
                    disabled={actionPending}
                    className="flex h-8 w-full items-center justify-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-semibold text-[var(--text-dim)] hover:text-[var(--text)] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Shield size={13} /> {detail.user.role === "admin" ? "Demote" : "Promote Admin"}
                  </button>
                </div>
              </div>

              {showEmailForm && (
                <div className="mb-5 rounded-[10px] border border-[var(--border)] p-3">
                  <h4 className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--text-dim)]">
                    <Mail size={13} /> Send email to {detail.user.email}
                  </h4>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Subject"
                    className="mb-2 h-8 w-full rounded-[7px] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[12.5px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
                  />
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Message..."
                    rows={4}
                    className="mb-2 w-full resize-none rounded-[7px] border border-[var(--border)] bg-[var(--bg)] px-2.5 py-2 text-[12.5px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={async () => {
                        if (!emailSubject.trim() || !emailMessage.trim()) return;
                        setSendingEmail(true);
                        try {
                          await onSendEmail(detail.user.id, emailSubject, emailMessage);
                          setEmailSubject("");
                          setEmailMessage("");
                          setShowEmailForm(false);
                        } catch {
                          // toast already shown by the hook — keep the form open so nothing is lost
                        } finally {
                          setSendingEmail(false);
                        }
                      }}
                      disabled={sendingEmail || actionPending || !emailSubject.trim() || !emailMessage.trim()}
                      className="flex h-8 items-center gap-1.5 rounded-[7px] bg-[var(--primary)] px-3 text-[12px] font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Send size={12} /> {sendingEmail ? "Sending…" : "Send"}
                    </button>
                    <button
                      onClick={() => setShowEmailForm(false)}
                      disabled={sendingEmail}
                      className="h-8 rounded-[7px] border border-[var(--border)] px-3 text-[12px] font-semibold text-[var(--text-dim)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

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

              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-[12.5px] font-semibold text-[var(--text-dim)]">Activity</h4>
                  <span className="text-[11px] text-[var(--text-faint)]">
                    Last active {detail.lastActiveAt ? formatDate(detail.lastActiveAt) : "—"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-[10px] border border-[var(--border)] p-3 text-center">
                    <Layers size={14} className="mx-auto mb-1 text-[var(--text-faint)]" />
                    <div className="text-[15px] font-bold">{detail.counts.collections}</div>
                    <div className="text-[10.5px] text-[var(--text-faint)]">Collections</div>
                  </div>
                  <div className="rounded-[10px] border border-[var(--border)] p-3 text-center">
                    <Workflow size={14} className="mx-auto mb-1 text-[var(--text-faint)]" />
                    <div className="text-[15px] font-bold">{detail.counts.workflows}</div>
                    <div className="text-[10.5px] text-[var(--text-faint)]">Workflows</div>
                  </div>
                  <div className="rounded-[10px] border border-[var(--border)] p-3 text-center">
                    <Code2 size={14} className="mx-auto mb-1 text-[var(--text-faint)]" />
                    <div className="text-[15px] font-bold">{detail.counts.snippets}</div>
                    <div className="text-[10.5px] text-[var(--text-faint)]">Snippets</div>
                  </div>
                </div>
              </div>

              <h4 className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--text-dim)]">
                <Wrench size={13} /> Tools used
              </h4>
              {detail.topTools.length === 0 ? (
                <p className="mb-5 rounded-[10px] border border-dashed border-[var(--border)] p-4 text-center text-[12.5px] text-[var(--text-faint)]">
                  No tool activity yet.
                </p>
              ) : (
                <div className="mb-5 flex flex-col gap-1.5">
                  {detail.topTools.map((t) => (
                    <div
                      key={t.toolId}
                      className="flex items-center justify-between rounded-[9px] border border-[var(--border)] px-3 py-2"
                    >
                      <span className="truncate text-[12.5px] font-medium">{t.name}</span>
                      <span className="flex-shrink-0 text-[11.5px] font-semibold text-[var(--text-dim)]">
                        {t.count.toLocaleString()}×
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <h4 className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--text-dim)]">
                <History size={13} /> Recent activity
              </h4>
              {detail.recentActivity.length === 0 ? (
                <p className="mb-5 rounded-[10px] border border-dashed border-[var(--border)] p-4 text-center text-[12.5px] text-[var(--text-faint)]">
                  No activity recorded yet.
                </p>
              ) : (
                <div className="mb-5 flex flex-col gap-1.5">
                  {detail.recentActivity.map((ev) => {
                    const meta = ACTIVITY_META[ev.type as ActivityType];
                    const Icon = meta?.icon ?? History;
                    return (
                      <div key={ev.id} className="flex items-center gap-2.5 rounded-[9px] border border-[var(--border)] px-3 py-2">
                        <Icon size={13} className="flex-shrink-0 text-[var(--text-faint)]" />
                        <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--text-dim)]">
                          {meta ? meta.label(ev.entityName) : ev.type}
                        </span>
                        <span className="flex-shrink-0 text-[10.5px] text-[var(--text-faint)]">{formatTimeAgo(ev.createdAt)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <h4 className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--text-dim)]">
                Login history
              </h4>
              {detail.sessions.length === 0 ? (
                <p className="mb-5 rounded-[10px] border border-dashed border-[var(--border)] p-4 text-center text-[12.5px] text-[var(--text-faint)]">
                  No sessions recorded yet.
                </p>
              ) : (
                <div className="mb-5 flex flex-col gap-1.5">
                  {detail.sessions.map((s) => {
                    const isActive = new Date(s.expiresAt).getTime() > Date.now();
                    return (
                      <div key={s.id} className="flex items-center justify-between gap-2 rounded-[9px] border border-[var(--border)] px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] text-[var(--text-dim)]">
                            {s.ipAddress ?? "Unknown IP"}
                            {s.userAgent && <span className="text-[var(--text-faint)]"> · {s.userAgent}</span>}
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          {isActive && (
                            <span className="rounded-full bg-[var(--success)]/10 px-2 py-[2px] text-[10px] font-semibold text-[var(--success)]">Active</span>
                          )}
                          <span className="text-[10.5px] text-[var(--text-faint)]">{formatTimeAgo(s.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

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
