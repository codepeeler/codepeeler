import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { toolUsage } from "@/lib/db/schema";

/**
 * Increment-with-upsert, same pattern as incrementUsage() in lib/usage.ts.
 * Called from /api/tools/track whenever a signed-in user opens a tool page.
 */
export async function recordToolUsageServer(userId: string, toolId: string) {
  const id = `${userId}:${toolId}`;
  await db
    .insert(toolUsage)
    .values({ id, userId, toolId, count: 1, lastUsedAt: new Date() })
    .onConflictDoUpdate({
      target: toolUsage.id,
      set: { count: sql`${toolUsage.count} + 1`, lastUsedAt: new Date() },
    });
}

/** All tools a user has used, most-used first. Powers the dashboard's Favorite Tools. */
export async function getToolUsageForUser(userId: string, limit = 8) {
  return db.select().from(toolUsage).where(eq(toolUsage.userId, userId)).orderBy(desc(toolUsage.count)).limit(limit);
}
