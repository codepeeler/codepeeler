import { NextRequest, NextResponse } from "next/server";
import { eq, gte, inArray, sql } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { user, subscription, usage } from "@/lib/db/schema";
import { PRO_ACTIVE_STATUSES } from "@/lib/entitlements";

function currentPeriodKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const period = currentPeriodKey();

  const [[{ count: totalUsers }], [{ count: newUsersLast7Days }], [{ count: proUserCount }], usageRows] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(user),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(user)
        .where(gte(user.createdAt, sevenDaysAgo)),
      // count(distinct user_id) — a user shouldn't have more than one active
      // row (subscription/create blocks that), but distinct keeps this safe
      // regardless.
      db
        .select({ count: sql<number>`count(distinct ${subscription.userId})::int` })
        .from(subscription)
        .where(inArray(subscription.status, PRO_ACTIVE_STATUSES)),
      db
        .select({ type: usage.type, total: sql<number>`sum(${usage.count})::int` })
        .from(usage)
        .where(eq(usage.periodKey, period))
        .groupBy(usage.type),
    ]);

  const usageThisPeriod = Object.fromEntries(usageRows.map((r) => [r.type, r.total ?? 0]));

  return NextResponse.json({
    totalUsers,
    newUsersLast7Days,
    proUsers: proUserCount,
    freeUsers: totalUsers - proUserCount,
    executionsThisPeriod: usageThisPeriod["executions"] ?? 0,
    aiCallsThisPeriod: usageThisPeriod["ai-calls"] ?? 0,
  });
}
