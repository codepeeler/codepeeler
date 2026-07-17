"use client";

import { History } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import type { AuditLogEntry } from "@/hooks/use-admin-audit-log";

const ACTION_LABELS: Record<string, string> = {
  grant_pro: "Granted Pro",
  revoke_pro: "Revoked Pro",
  ban: "Banned user",
  unban: "Unbanned user",
  promote_admin: "Promoted to admin",
  demote_admin: "Demoted from admin",
  reset_usage: "Reset usage",
  send_email: "Sent email",
  update_site_settings: "Updated site settings",
};

function describeDetails(action: string, details: Record<string, unknown> | null) {
  if (!details) return null;
  if (action === "grant_pro" && details.duration) return `Duration: ${details.duration}`;
  if (action === "reset_usage" && details.type) return `Type: ${details.type}`;
  if (action === "send_email" && details.subject) return `Subject: ${details.subject}`;
  return null;
}

type Props = {
  entries: AuditLogEntry[];
  loading: boolean;
  page: number;
  setPage: (p: number) => void;
};

export default function AdminAuditLogTable({ entries, loading, page, setPage }: Props) {
  return (
    <div className="rounded-[14px] border border-[var(--border)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--border-soft)] px-4 py-3">
        <History size={14} className="text-[var(--text-faint)]" />
        <h3 className="text-[13px] font-semibold">Audit log</h3>
      </div>

      {loading ? (
        <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">No admin actions recorded yet.</div>
      ) : (
        <div className="divide-y divide-[var(--border-soft)]">
          {entries.map((e) => {
            const detail = describeDetails(e.action, e.details);
            return (
              <div key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px]">
                    <span className="font-semibold">{e.admin?.name ?? "Unknown admin"}</span>{" "}
                    <span className="text-[var(--text-dim)]">{ACTION_LABELS[e.action] ?? e.action}</span>
                    {e.target && (
                      <>
                        {" "}
                        <span className="text-[var(--text-faint)]">→</span> <span className="font-medium">{e.target.name}</span>
                      </>
                    )}
                  </div>
                  {detail && <div className="text-[11px] text-[var(--text-faint)]">{detail}</div>}
                </div>
                <span className="flex-shrink-0 text-[11px] text-[var(--text-faint)]">{formatTimeAgo(e.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[var(--border-soft)] px-4 py-2.5">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-[7px] border border-[var(--border)] px-3 py-1 text-[11.5px] font-semibold text-[var(--text-dim)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-[11.5px] text-[var(--text-faint)]">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={entries.length === 0}
          className="rounded-[7px] border border-[var(--border)] px-3 py-1 text-[11.5px] font-semibold text-[var(--text-dim)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
