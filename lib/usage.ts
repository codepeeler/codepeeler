import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { usage } from "@/lib/db/schema";

export type UsageType = "executions" | "ai-calls";

const ALL_TYPES: UsageType[] = ["executions", "ai-calls"];

function currentPeriodKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Current count for one metered type this period (0 if no row / stale period yet). */
export async function getUsage(userId: string, type: UsageType): Promise<number> {
  const id = `${userId}:${type}`;
  const [row] = await db.select().from(usage).where(eq(usage.id, id));
  if (!row || row.periodKey !== currentPeriodKey()) return 0;
  return row.count;
}

/** All metered counts for this period at once — powers the /api/entitlements response. */
export async function getUsageSnapshot(userId: string): Promise<Record<UsageType, number>> {
  const counts = await Promise.all(ALL_TYPES.map((type) => getUsage(userId, type)));
  return Object.fromEntries(ALL_TYPES.map((type, i) => [type, counts[i]])) as Record<UsageType, number>;
}

/**
 * Atomically-enough increment-with-reset: if the stored period is stale, start
 * this period's count at 1; otherwise bump it. Not a true DB-level atomic
 * upsert (fine at current traffic — see entitlements plan doc for the
 * Redis/Upstash upgrade path if concurrency ever becomes an issue).
 * Returns the new count after incrementing.
 */
export async function incrementUsage(userId: string, type: UsageType): Promise<number> {
  const id = `${userId}:${type}`;
  const period = currentPeriodKey();
  const [row] = await db.select().from(usage).where(eq(usage.id, id));

  const newCount = !row || row.periodKey !== period ? 1 : row.count + 1;

  await db
    .insert(usage)
    .values({ id, userId, type, count: newCount, periodKey: period })
    .onConflictDoUpdate({ target: usage.id, set: { count: newCount, periodKey: period, updatedAt: new Date() } });

  return newCount;
}

/**
 * The pattern every metered route should follow: check the limit BEFORE doing
 * the expensive/costly work, only increment after it actually happens.
 * Usage: const gate = await checkUsageLimit(userId, "ai-calls", entitlements.limits.aiCallsPerMonth);
 * if (!gate.allowed) return 402 ...
 */
export async function checkUsageLimit(
  userId: string,
  type: UsageType,
  limit: number
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const used = await getUsage(userId, type);
  return { allowed: used < limit, used, limit };
}
