import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { refundRequest, user } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const rows = await db.select().from(refundRequest).orderBy(desc(refundRequest.createdAt));
  const userIds = Array.from(new Set(rows.map((r) => r.userId)));
  const users = userIds.length ? await db.select({ id: user.id, name: user.name, email: user.email }).from(user) : [];
  const userMap = new Map(users.filter((u) => userIds.includes(u.id)).map((u) => [u.id, u]));

  const refunds = rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(), user: userMap.get(r.userId) ?? null }));
  return NextResponse.json({ refunds });
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = (await req.json()) as { email?: string; subscriptionId?: string; amount?: number; reason?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "User email is required" }, { status: 400 });

  const [targetUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
  if (!targetUser) return NextResponse.json({ error: "No user found with that email" }, { status: 404 });

  const [created] = await db
    .insert(refundRequest)
    .values({
      id: crypto.randomUUID(),
      userId: targetUser.id,
      subscriptionId: body.subscriptionId?.trim() || null,
      amount: body.amount ?? null,
      reason: body.reason?.trim() ?? "",
    })
    .returning();

  await logAdminAction(session.user.id, targetUser.id, "create_refund_request", { amount: created.amount });
  return NextResponse.json({ refund: created });
}
