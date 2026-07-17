import { NextRequest, NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { user, subscription, session, collection, workflow, snippet } from "@/lib/db/schema";
import { getUserEntitlements, PRO_ACTIVE_STATUSES } from "@/lib/entitlements";
import { getToolUsageForUser } from "@/lib/tool-usage-server";
import { getRecentActivity } from "@/lib/activity";
import { TOOLS } from "@/lib/data/tools";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session_ = await requireAdminSession(req.headers);
  if (!session_) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;

  const [targetUser] = await db.select().from(user).where(eq(user.id, id));
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [
    subscriptions,
    entitlements,
    topToolRows,
    [{ count: collectionCount }],
    [{ count: workflowCount }],
    [{ count: snippetCount }],
    [lastSession],
    sessions,
    recentActivity,
  ] = await Promise.all([
    db.select().from(subscription).where(eq(subscription.userId, id)).orderBy(desc(subscription.createdAt)),
    getUserEntitlements(id),
    getToolUsageForUser(id),
    db.select({ count: sql<number>`count(*)::int` }).from(collection).where(eq(collection.userId, id)),
    db.select({ count: sql<number>`count(*)::int` }).from(workflow).where(eq(workflow.userId, id)),
    db.select({ count: sql<number>`count(*)::int` }).from(snippet).where(eq(snippet.userId, id)),
    db.select({ updatedAt: session.updatedAt }).from(session).where(eq(session.userId, id)).orderBy(desc(session.updatedAt)).limit(1),
    db
      .select({ id: session.id, ipAddress: session.ipAddress, userAgent: session.userAgent, createdAt: session.createdAt, expiresAt: session.expiresAt })
      .from(session)
      .where(eq(session.userId, id))
      .orderBy(desc(session.createdAt))
      .limit(10),
    getRecentActivity(id, 15),
  ]);

  const toolNameById = new Map(TOOLS.map((t) => [t.id, t.name]));
  const topTools = topToolRows.map((t) => ({
    toolId: t.toolId,
    name: toolNameById.get(t.toolId) ?? t.toolId,
    count: t.count,
    lastUsedAt: t.lastUsedAt,
  }));

  return NextResponse.json({
    user: targetUser,
    subscriptions,
    activeSubscription: subscriptions.find((s) => PRO_ACTIVE_STATUSES.includes(s.status)) ?? null,
    entitlements,
    topTools,
    counts: { collections: collectionCount, workflows: workflowCount, snippets: snippetCount },
    lastActiveAt: lastSession?.updatedAt ?? null,
    sessions: sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
    })),
    recentActivity,
  });
}
