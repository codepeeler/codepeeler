import { NextRequest, NextResponse } from "next/server";
import { desc, ilike, inArray, or, sql } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { user, subscription, usage } from "@/lib/db/schema";
import { PRO_ACTIVE_STATUSES } from "@/lib/entitlements";

const PAGE_SIZE = 20;

function currentPeriodKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Paginated user list with plan + this-period usage joined in. Fetches the
 * page of users first, then batch-fetches subscriptions/usage for just
 * those ids (two extra queries total, not per-row) rather than a single
 * heavier join — keeps each query simple and easy to reason about at our
 * current scale.
 */
export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const whereClause = q ? or(ilike(user.name, `%${q}%`), ilike(user.email, `%${q}%`)) : undefined;

  const [rows, [{ count: total }]] = await Promise.all([
    db
      .select({ id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified, role: user.role, banned: user.banned, createdAt: user.createdAt })
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(user)
      .where(whereClause),
  ]);

  const ids = rows.map((r) => r.id);
  const period = currentPeriodKey();

  const [subs, usageRows] = ids.length
    ? await Promise.all([
        db.select().from(subscription).where(inArray(subscription.userId, ids)),
        db.select().from(usage).where(inArray(usage.userId, ids)),
      ])
    : [[], []];

  const activeSubByUser = new Map(subs.filter((s) => PRO_ACTIVE_STATUSES.includes(s.status)).map((s) => [s.userId, s]));
  const usageByUser = new Map<string, Record<string, number>>();
  for (const row of usageRows) {
    if (row.periodKey !== period) continue; // stale period = 0, same rule as lib/usage.ts
    const entry = usageByUser.get(row.userId) ?? {};
    entry[row.type] = row.count;
    usageByUser.set(row.userId, entry);
  }

  const users = rows.map((r) => {
    const activeSub = activeSubByUser.get(r.id);
    const rowUsage = usageByUser.get(r.id) ?? {};
    return {
      ...r,
      plan: activeSub ? ("pro" as const) : ("free" as const),
      subscriptionStatus: activeSub?.status ?? null,
      billingCycle: activeSub?.billingCycle ?? null,
      currentPeriodEnd: activeSub?.currentPeriodEnd ?? null,
      executionsUsed: rowUsage["executions"] ?? 0,
      aiCallsUsed: rowUsage["ai-calls"] ?? 0,
    };
  });

  return NextResponse.json({ users, page, pageSize: PAGE_SIZE, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) });
}
