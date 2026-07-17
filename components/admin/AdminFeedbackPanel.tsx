"use client";

import { MessageSquare, Star } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import type { FeedbackEntry } from "@/hooks/use-admin-feedback";

const STATUS_OPTIONS: FeedbackEntry["status"][] = ["new", "reviewed", "resolved", "wont_fix"];

const STATUS_COLORS: Record<FeedbackEntry["status"], string> = {
  new: "text-[var(--danger)] bg-[var(--danger-dim)]",
  reviewed: "text-[var(--warning)] bg-[var(--warning-dim)]",
  resolved: "text-[var(--success)] bg-[var(--success-dim)]",
  wont_fix: "text-[var(--text-faint)] bg-[var(--card-hover)]",
};

type Props = {
  title: string;
  emptyLabel: string;
  entries: FeedbackEntry[];
  loading: boolean;
  onUpdateStatus: (id: string, status: FeedbackEntry["status"]) => void;
};

export default function AdminFeedbackPanel({ title, emptyLabel, entries, loading, onUpdateStatus }: Props) {
  return (
    <div className="rounded-[14px] border border-[var(--border)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--border-soft)] px-4 py-3">
        <MessageSquare size={14} className="text-[var(--text-faint)]" />
        <h3 className="text-[13px] font-semibold">{title}</h3>
      </div>

      {loading ? (
        <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="py-10 text-center text-[13px] text-[var(--text-faint)]">{emptyLabel}</div>
      ) : (
        <div className="divide-y divide-[var(--border-soft)]">
          {entries.map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[12.5px]">
                  <span className="font-semibold">{e.user?.name ?? "Anonymous"}</span>
                  {e.type === "rating" && e.rating != null && (
                    <span className="flex items-center gap-0.5 text-[var(--warning)]">
                      {Array.from({ length: e.rating }).map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" />
                      ))}
                    </span>
                  )}
                </div>
                {e.message && <div className="mt-1 text-[11.5px] text-[var(--text-faint)]">{e.message}</div>}
                <div className="mt-1 text-[10.5px] text-[var(--text-faint)]">{formatTimeAgo(e.createdAt)}</div>
              </div>
              <select
                value={e.status}
                onChange={(ev) => onUpdateStatus(e.id, ev.target.value as FeedbackEntry["status"])}
                className={`flex-shrink-0 rounded-[6px] border-0 px-2 py-1 text-[11px] font-semibold outline-none ${STATUS_COLORS[e.status]}`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
