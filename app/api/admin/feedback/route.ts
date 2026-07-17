import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { feedbackEntry, user } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const typeFilter = req.nextUrl.searchParams.get("type");
  const rows = typeFilter
    ? await db.select().from(feedbackEntry).where(eq(feedbackEntry.type, typeFilter)).orderBy(desc(feedbackEntry.createdAt))
    : await db.select().from(feedbackEntry).orderBy(desc(feedbackEntry.createdAt));

  const userIds = Array.from(new Set(rows.map((r) => r.userId).filter((x): x is string => !!x)));
  const users = userIds.length ? await db.select({ id: user.id, name: user.name, email: user.email }).from(user) : [];
  const userMap = new Map(users.filter((u) => userIds.includes(u.id)).map((u) => [u.id, u]));

  const entries = rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), user: r.userId ? (userMap.get(r.userId) ?? null) : null }));
  return NextResponse.json({ entries });
}
