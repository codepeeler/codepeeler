"use client";

import { Search, ChevronLeft, ChevronRight, BadgeCheck, CircleAlert } from "lucide-react";
import type { AdminUserRow } from "@/hooks/use-admin-panel";

function PlanPill({ plan }: { plan: "free" | "pro" }) {
  if (plan === "pro") {
    return (
      <span className="inline-flex items-center rounded-full bg-[var(--accent)]/10 px-2 py-[3px] text-[11px] font-bold text-[var(--accent)]">
        Pro
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border)] px-2 py-[3px] text-[11px] font-semibold text-[var(--text-faint)]">
      Free
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

type Props = {
  query: string;
  setQuery: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  users: AdminUserRow[];
  loading: boolean;
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
  onSelectUser: (id: string) => void;
};

export default function AdminUsersTable({ query, setQuery, onSearchSubmit, users, loading, page, totalPages, setPage, onSelectUser }: Props) {
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-soft)] p-4">
        <h2 className="text-[14px] font-semibold">Users</h2>
        <form onSubmit={onSearchSubmit} className="relative">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="h-9 w-[240px] rounded-[8px] border border-[var(--border)] bg-[var(--bg)] pl-8 pr-3 text-[12.5px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-[var(--border-soft)] text-[11px] font-semibold uppercase tracking-wide text-[var(--text-faint)]">
              <th className="px-4 py-2.5">User</th>
              <th className="px-4 py-2.5">Plan</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Executions</th>
              <th className="px-4 py-2.5">AI Calls</th>
              <th className="px-4 py-2.5">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-faint)]">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-faint)]">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => onSelectUser(u.id)}
                  className="cursor-pointer border-b border-[var(--border-soft)] transition-colors duration-150 last:border-0 hover:bg-[var(--card-hover)]"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text)]">{u.name}</td>
                  <td className="px-4 py-3">
                    <PlanPill plan={u.plan} />
                  </td>
                  <td className="px-4 py-3 text-[var(--text-dim)]">
                    <span className="flex items-center gap-1.5">
                      {u.emailVerified ? (
                        <BadgeCheck size={13} className="flex-shrink-0 text-[var(--success)]" />
                      ) : (
                        <CircleAlert size={13} className="flex-shrink-0 text-[var(--warning)]" />
                      )}
                      {u.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-dim)]">{u.executionsUsed.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[var(--text-dim)]">{u.aiCallsUsed.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[var(--text-faint)]">{formatDate(u.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border-soft)] px-4 py-3 text-[12px] text-[var(--text-faint)]">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border)] text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-[var(--border)] text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
