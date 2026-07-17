import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { adminAuditLog, user } from "@/lib/db/schema";

const PAGE_SIZE = 30;

/**
 * Paginated audit log, newest first. Joins in the admin's and the target
 * user's name/email at read time (denormalizing at write time isn't worth
 * it here — this is a low-traffic admin-only read, and it stays accurate
 * even if someone's name changes later).
 */
export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? "1"));

  const rows = await db
    .select({
      id: adminAuditLog.id,
      action: adminAuditLog.action,
      details: adminAuditLog.details,
      createdAt: adminAuditLog.createdAt,
      adminUserId: adminAuditLog.adminUserId,
      targetUserId: adminAuditLog.targetUserId,
    })
    .from(adminAuditLog)
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  // Batch-fetch names for every admin/target id in this page instead of a
  // join, so this stays a plain read even if adminAuditLog grows large.
  const ids = Array.from(new Set(rows.flatMap((r) => [r.adminUserId, r.targetUserId]).filter((x): x is string => !!x)));
  const users = ids.length
    ? await db.select({ id: user.id, name: user.name, email: user.email }).from(user)
    : [];
  const userMap = new Map(users.filter((u) => ids.includes(u.id)).map((u) => [u.id, u]));

  const entries = rows.map((r) => ({
    id: r.id,
    action: r.action,
    details: r.details,
    createdAt: r.createdAt.toISOString(),
    admin: userMap.get(r.adminUserId) ?? null,
    target: r.targetUserId ? (userMap.get(r.targetUserId) ?? null) : null,
  }));

  return NextResponse.json({ entries, page });
}
