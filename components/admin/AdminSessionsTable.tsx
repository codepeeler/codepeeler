"use client";

import { Monitor, X } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import type { AdminSessionRow } from "@/hooks/use-admin-sessions";

type Props = {
  sessions: AdminSessionRow[];
  loading: boolean;
  page: number;
  setPage: (p: number) => void;
  onRevoke: (id: string) => void;
  revokingId: string | null;
};

function shortAgent(ua: string | null) {
  if (!ua) return "Unknown device";
  if (/iphone/i.test(ua)) return "iPhone · Safari";
  if (/android/i.test(ua)) return "Android";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return ua.slice(0, 40);
}

export default function AdminSessionsTable({ sessions, loading, page, setPage, onRevoke, revokingId }: Props) {
  return (
    <div className="rounded-[14px] border border-[var(--border)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--border-soft)] px-4 py-3">
        <Monitor size={14} className="text-[var(--text-faint)]" />
        <h3 className="text-[13px] font-semibold">Active sessions</h3>
        <span className="text-[11.5px] text-[var(--text-faint)]">— login history sourced from the session table</span>
      </div>

      {loading ? (
        <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
      ) : sessions.length === 0 ? (
        <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">No active sessions right now.</div>
      ) : (
        <div className="divide-y divide-[var(--border-soft)]">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px]">
                  <span className="font-semibold">{s.user?.name ?? "Unknown user"}</span>{" "}
                  <span className="text-[var(--text-dim)]">{s.user?.email}</span>
                </div>
                <div className="text-[11px] text-[var(--text-faint)]">
                  {shortAgent(s.userAgent)} · {s.ipAddress ?? "unknown IP"} · signed in {formatTimeAgo(s.createdAt)}
                </div>
              </div>
              <button
                onClick={() => onRevoke(s.id)}
                disabled={revokingId === s.id}
                className="flex flex-shrink-0 items-center gap-1 rounded-[7px] border border-[var(--border)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--danger)] hover:bg-[var(--danger-dim)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X size={12} />
                Revoke
              </button>
            </div>
          ))}
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
          disabled={sessions.length === 0}
          className="rounded-[7px] border border-[var(--border)] px-3 py-1 text-[11.5px] font-semibold text-[var(--text-dim)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
