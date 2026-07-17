import { NextRequest, NextResponse } from "next/server";
import { desc, gt } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { session, user } from "@/lib/db/schema";

const PAGE_SIZE = 30;

/**
 * All non-expired sessions across every user, newest first — the "Login
 * History / Active Sessions" surface (session data already existed in the
 * better-auth session table; this just exposes it in the admin UI). Same
 * batch-fetch-names pattern as the audit log route.
 */
export async function GET(req: NextRequest) {
  const adminSession = await requireAdminSession(req.headers);
  if (!adminSession) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? "1"));
  const now = new Date();

  const rows = await db
    .select({
      id: session.id,
      userId: session.userId,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    })
    .from(session)
    .where(gt(session.expiresAt, now))
    .orderBy(desc(session.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const userIds = Array.from(new Set(rows.map((r) => r.userId)));
  const users = userIds.length ? await db.select({ id: user.id, name: user.name, email: user.email }).from(user) : [];
  const userMap = new Map(users.filter((u) => userIds.includes(u.id)).map((u) => [u.id, u]));

  const sessions = rows.map((r) => ({
    id: r.id,
    ipAddress: r.ipAddress,
    userAgent: r.userAgent,
    createdAt: r.createdAt.toISOString(),
    expiresAt: r.expiresAt.toISOString(),
    user: userMap.get(r.userId) ?? null,
  }));

  return NextResponse.json({ sessions, page });
}
