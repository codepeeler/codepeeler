"use client";

import { UserCog } from "lucide-react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/utils";
import type { AdminLogRow } from "@/hooks/use-admin-logs";

export default function AdminLogsPanel({ admins, loading }: { admins: AdminLogRow[]; loading: boolean }) {
  return (
    <div className="rounded-[14px] border border-[var(--border)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--border-soft)] px-4 py-3">
        <UserCog size={14} className="text-[var(--text-faint)]" />
        <h3 className="text-[13px] font-semibold">Admin activity</h3>
        <span className="text-[11.5px] text-[var(--text-faint)]">— per-admin rollup of the audit log</span>
      </div>

      {loading ? (
        <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
      ) : admins.length === 0 ? (
        <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">No admin actions logged yet.</div>
      ) : (
        <div className="divide-y divide-[var(--border-soft)]">
          {admins.map((a) => (
            <div key={a.admin?.id ?? a.lastActionAt} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold">{a.admin?.name ?? "Unknown admin"}</div>
                <div className="text-[11.5px] text-[var(--text-dim)]">{a.admin?.email}</div>
                <div className="text-[10.5px] text-[var(--text-faint)]">
                  Last: {a.lastAction} · {formatTimeAgo(a.lastActionAt)}
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                <span className="rounded-[6px] bg-[var(--card-hover)] px-2 py-1 text-[11px] font-semibold text-[var(--text-dim)]">
                  {a.actionCount} actions
                </span>
                <Link href="/admin/security/audit-logs" className="text-[11px] font-semibold text-[var(--primary)] hover:underline">
                  View feed
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
