import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { user, subscription } from "@/lib/db/schema";
import { getUserEntitlements, PRO_ACTIVE_STATUSES } from "@/lib/entitlements";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;

  const [targetUser] = await db.select().from(user).where(eq(user.id, id));
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [subscriptions, entitlements] = await Promise.all([
    db.select().from(subscription).where(eq(subscription.userId, id)).orderBy(desc(subscription.createdAt)),
    getUserEntitlements(id),
  ]);

  return NextResponse.json({
    user: targetUser,
    subscriptions,
    activeSubscription: subscriptions.find((s) => PRO_ACTIVE_STATUSES.includes(s.status)) ?? null,
    entitlements,
  });
}
