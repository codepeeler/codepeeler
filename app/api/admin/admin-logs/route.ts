import { NextRequest, NextResponse } from "next/server";
import { desc, sql } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { adminAuditLog, user } from "@/lib/db/schema";

/**
 * "Admin Logs" vs "Audit Logs": Audit Logs is the raw newest-first feed of
 * every action; this is the per-admin rollup on top of the same table —
 * how many actions each admin has taken and when they were last active,
 * for a quick "who's doing what" glance rather than scrolling the feed.
 */
export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const rows = await db
    .select({
      adminUserId: adminAuditLog.adminUserId,
      actionCount: sql<number>`count(*)`.mapWith(Number),
      lastAction: sql<string>`max(${adminAuditLog.action})`,
      lastActionAt: sql<Date>`max(${adminAuditLog.createdAt})`,
    })
    .from(adminAuditLog)
    .groupBy(adminAuditLog.adminUserId)
    .orderBy(desc(sql`max(${adminAuditLog.createdAt})`));

  const ids = rows.map((r) => r.adminUserId);
  const users = ids.length ? await db.select({ id: user.id, name: user.name, email: user.email }).from(user) : [];
  const userMap = new Map(users.filter((u) => ids.includes(u.id)).map((u) => [u.id, u]));

  const admins = rows.map((r) => ({
    admin: userMap.get(r.adminUserId) ?? null,
    actionCount: r.actionCount,
    lastAction: r.lastAction,
    lastActionAt: r.lastActionAt instanceof Date ? r.lastActionAt.toISOString() : r.lastActionAt,
  }));

  return NextResponse.json({ admins });
}
