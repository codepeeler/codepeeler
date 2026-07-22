import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { user, subscription, session, activityEvent, toolUsage } from "@/lib/db/schema";
import { PRO_ACTIVE_STATUSES } from "@/lib/entitlements";
import { TOOLS } from "@/lib/data/tools";
import { PLANS } from "@/lib/data/pricing";

const DAYS = 14;

// Real monthly-equivalent price per billing cycle, pulled from the same
// PLANS data the pricing page renders — never hardcode a second copy of
// these numbers, or they'll drift out of sync with what customers actually
// see and pay.
const PRO_PLAN = PLANS.find((p) => p.key === "pro")!;
const PRICE_BY_CYCLE: Record<string, number> = {
  monthly: PRO_PLAN.price.monthly ?? 0,
  yearly: PRO_PLAN.price.yearly ?? 0,
};

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(dayKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000)));
  }
  return days;
}

export async function GET(req: NextRequest) {
  const adminSession = await requireAdminSession(req.headers);
  if (!adminSession) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dbPingStart = Date.now();

  const [
    [{ count: activeUsers30d }],
    activeSubs,
    signupRows,
    toolRunRows,
    topToolRows,
    countryRows,
    newUsers,
    recentEvents,
  ] = await Promise.all([
    // "Active" = had a session updated in the last 30 days (existing
    // session table, no new tracking needed).
    db
      .select({ count: sql<number>`count(distinct ${session.userId})::int` })
      .from(session)
      .where(gte(session.updatedAt, thirtyDaysAgo)),
    db.select({ billingCycle: subscription.billingCycle }).from(subscription).where(inArray(subscription.status, PRO_ACTIVE_STATUSES)),
    db
      .select({ day: sql<string>`to_char(${user.createdAt}, 'YYYY-MM-DD')`, count: sql<number>`count(*)::int` })
      .from(user)
      .where(gte(user.createdAt, since))
      .groupBy(sql`1`),
    // Tool runs per day come from activity_event (type = "tool_use"), which
    // has a timestamp per event — toolUsage below only keeps a running
    // total per tool, not a daily breakdown, so it can't answer "which day".
    db
      .select({ day: sql<string>`to_char(${activityEvent.createdAt}, 'YYYY-MM-DD')`, count: sql<number>`count(*)::int` })
      .from(activityEvent)
      .where(and(eq(activityEvent.type, "tool_use"), gte(activityEvent.createdAt, since)))
      .groupBy(sql`1`),
    // Top tools: toolUsage is the purpose-built running counter (one row
    // per user+tool, incremented on every run) — a better source than
    // aggregating activity_event, and cheaper to query.
    db
      .select({ toolId: toolUsage.toolId, totalRuns: sql<number>`sum(${toolUsage.count})::int`, users: sql<number>`count(distinct ${toolUsage.userId})::int` })
      .from(toolUsage)
      .groupBy(toolUsage.toolId)
      .orderBy(desc(sql`sum(${toolUsage.count})`))
      .limit(5),
    db
      .select({ country: user.country, count: sql<number>`count(*)::int` })
      .from(user)
      .groupBy(user.country)
      .orderBy(desc(sql`count(*)`)),
    db.select({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }).from(user).orderBy(desc(user.createdAt)).limit(5),
    db
      .select({
        id: activityEvent.id,
        type: activityEvent.type,
        entityName: activityEvent.entityName,
        createdAt: activityEvent.createdAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(activityEvent)
      .innerJoin(user, eq(activityEvent.userId, user.id))
      .orderBy(desc(activityEvent.createdAt))
      .limit(8),
  ]);

  const dbPingMs = Date.now() - dbPingStart;
  const mrr = activeSubs.reduce((sum, s) => sum + (PRICE_BY_CYCLE[s.billingCycle] ?? 0), 0);

  const signupsByDay = Object.fromEntries(signupRows.map((r) => [r.day, r.count]));
  const toolRunsByDay = Object.fromEntries(toolRunRows.map((r) => [r.day, r.count]));
  const days = lastNDays(DAYS);
  const signupsOverTime = days.map((d) => ({ day: d, signups: signupsByDay[d] ?? 0 }));
  const toolRunsOverTime = days.map((d) => ({ day: d, toolRuns: toolRunsByDay[d] ?? 0 }));

  const toolNameById = new Map(TOOLS.map((t) => [t.id, t.name]));
  const topTools = topToolRows.map((r) => ({ id: r.toolId, name: toolNameById.get(r.toolId) ?? r.toolId, runs: r.totalRuns, users: r.users }));

  const totalCountryUsers = countryRows.reduce((sum, r) => sum + r.count, 0);
  const knownCountries = countryRows.filter((r) => r.country);
  const unknownCount = countryRows.find((r) => !r.country)?.count ?? 0;
  const topCountries = knownCountries.slice(0, 5);
  const otherCount = knownCountries.slice(5).reduce((sum, r) => sum + r.count, 0) + unknownCount;
  const countryBreakdown = [
    ...topCountries.map((r) => ({
      country: r.country as string,
      count: r.count,
      pct: totalCountryUsers ? Math.round((r.count / totalCountryUsers) * 1000) / 10 : 0,
    })),
    ...(otherCount > 0
      ? [{ country: "Unknown/Other", count: otherCount, pct: totalCountryUsers ? Math.round((otherCount / totalCountryUsers) * 1000) / 10 : 0 }]
      : []),
  ];

  return NextResponse.json({
    activeUsers30d,
    mrr,
    totalTools: TOOLS.length,
    dbStatus: { healthy: true, pingMs: dbPingMs },
    signupsOverTime,
    toolRunsOverTime,
    topTools,
    countryBreakdown,
    newUsers: newUsers.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })),
    recentActivity: recentEvents.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
  });
}
