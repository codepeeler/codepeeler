import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { activityEvent } from "@/lib/db/schema";

export type ActivityType =
  | "tool_use"
  | "snippet_create"
  | "snippet_view"
  | "snippet_use"
  | "collection_create"
  | "collection_update"
  | "workflow_create"
  | "workflow_run";

/**
 * Logs one history event. Wrapped in try/catch on purpose: activity logging
 * is a side-effect of the real action (creating a snippet, running a
 * workflow, ...) and must never be the reason that real action fails, so a
 * logging error is swallowed here rather than thrown back to the caller.
 */
export async function recordActivity(
  userId: string,
  type: ActivityType,
  entityId?: string | null,
  entityName?: string | null
) {
  try {
    await db.insert(activityEvent).values({
      id: crypto.randomUUID(),
      userId,
      type,
      entityId: entityId ?? null,
      entityName: entityName ?? null,
    });
  } catch {
    // best-effort — never block the real action on a logging failure
  }
}

/** Most recent events for one user, newest first. Powers the dashboard + admin "Recent Activity". */
export async function getRecentActivity(userId: string, limit = 20) {
  return db
    .select()
    .from(activityEvent)
    .where(eq(activityEvent.userId, userId))
    .orderBy(desc(activityEvent.createdAt))
    .limit(limit);
}
