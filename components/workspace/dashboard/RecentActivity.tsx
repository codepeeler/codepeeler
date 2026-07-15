import { History } from "lucide-react";
import { ACTIVITY_META } from "@/lib/data/activity";
import { formatTimeAgo } from "@/lib/utils";
import type { ActivityType } from "@/lib/activity";

type ActivityEvent = { id: string; type: string; entityId: string | null; entityName: string | null; createdAt: string };

/**
 * Real, chronological "what did I just do" feed — backed by the
 * activity_event table (see lib/activity.ts), not a derived/aggregate
 * number like the stat cards above it. Empty on a brand new account until
 * the user opens a tool, creates a snippet, etc.
 */
export default function RecentActivity({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="rounded-[12px] border border-dashed border-[var(--border)] p-4 text-center text-[12px] text-[var(--text-faint)]">
        No activity yet — start using a tool or create a snippet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {events.map((ev) => {
        const meta = ACTIVITY_META[ev.type as ActivityType];
        const Icon = meta?.icon ?? History;
        return (
          <div
            key={ev.id}
            className="flex items-center gap-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2"
          >
            <Icon size={13} className="flex-shrink-0 text-[var(--text-faint)]" />
            <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--text-dim)]">
              {meta ? meta.label(ev.entityName) : ev.type}
            </span>
            <span className="flex-shrink-0 text-[10.5px] text-[var(--text-faint)]">{formatTimeAgo(ev.createdAt)}</span>
          </div>
        );
      })}
    </div>
  );
}
