import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { and, eq, inArray } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { razorpay } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import { PRO_ACTIVE_STATUSES } from "@/lib/entitlements";

// Manual grants (comped Pro, support goodwill, etc.) get an id in this
// namespace instead of a real Razorpay subscription id, so revoke() below
// knows never to call the Razorpay API for them.
const MANUAL_ID_PREFIX = "manual_";

type Body = { action: "grant" | "revoke" };

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id: userId } = await params;
  const { action } = (await req.json()) as Body;

  if (action === "grant") {
    const [existing] = await db
      .select()
      .from(subscription)
      .where(and(eq(subscription.userId, userId), inArray(subscription.status, PRO_ACTIVE_STATUSES)));

    if (existing) {
      return NextResponse.json({ error: "This user already has an active subscription" }, { status: 409 });
    }

    const [row] = await db
      .insert(subscription)
      .values({
        id: `${MANUAL_ID_PREFIX}${crypto.randomUUID()}`,
        userId,
        planId: "manual-grant",
        billingCycle: "monthly",
        status: "active",
        // No currentPeriodEnd — manual grants don't expire on their own,
        // only an explicit revoke ends them.
      })
      .returning();

    return NextResponse.json({ subscription: row });
  }

  if (action === "revoke") {
    const [activeSub] = await db
      .select()
      .from(subscription)
      .where(and(eq(subscription.userId, userId), inArray(subscription.status, PRO_ACTIVE_STATUSES)));

    if (!activeSub) {
      return NextResponse.json({ error: "This user has no active subscription" }, { status: 404 });
    }

    // Real Razorpay subscription — cancel it there too, not just in our DB,
    // otherwise Razorpay keeps billing them next cycle.
    if (!activeSub.id.startsWith(MANUAL_ID_PREFIX)) {
      try {
        await razorpay.subscriptions.cancel(activeSub.id);
      } catch (err) {
        console.error(`Admin revoke: Razorpay cancel failed for ${activeSub.id}`, err);
        // Keep going — worst case Razorpay's own webhook/dashboard catches
        // it later; the user's Pro access is what admins care about right now.
      }
    }

    const [row] = await db
      .update(subscription)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(subscription.id, activeSub.id))
      .returning();

    return NextResponse.json({ subscription: row });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
