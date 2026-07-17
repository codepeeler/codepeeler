import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { and, eq, inArray, isNull, or, gt } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { razorpay } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import { PRO_ACTIVE_STATUSES } from "@/lib/entitlements";

// Manual grants (comped Pro, support goodwill, etc.) get an id in this
// namespace instead of a real Razorpay subscription id, so revoke() below
// knows never to call the Razorpay API for them.
const MANUAL_ID_PREFIX = "manual_";

// Preset durations the admin panel offers. `null` = lifetime / no expiry
// (currentPeriodEnd stays null, matching the old "grants never expire on
// their own" behavior). Anything else is in days, checked against
// currentPeriodEnd by getUserEntitlements() at read time — no cron needed.
const DURATION_DAYS: Record<string, number | null> = {
  "7d": 7,
  "1m": 30,
  "3m": 90,
  "6m": 180,
  "1y": 365,
  lifetime: null,
};

type Body = { action: "grant"; duration: keyof typeof DURATION_DAYS } | { action: "revoke" };

// Same "is this row currently active" rule as getUserEntitlements() — a
// row only blocks a new grant/counts as active if its status is right AND
// (it never expires OR its expiry hasn't passed yet).
function activeSubWhere(userId: string) {
  return and(
    eq(subscription.userId, userId),
    inArray(subscription.status, PRO_ACTIVE_STATUSES),
    or(isNull(subscription.currentPeriodEnd), gt(subscription.currentPeriodEnd, new Date()))
  );
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id: userId } = await params;
  const body = (await req.json()) as Body;

  if (body.action === "grant") {
    const duration = body.duration;
    if (!duration || !(duration in DURATION_DAYS)) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    const [existing] = await db.select().from(subscription).where(activeSubWhere(userId));
    if (existing) {
      return NextResponse.json({ error: "This user already has an active subscription" }, { status: 409 });
    }

    const days = DURATION_DAYS[duration];
    const currentPeriodEnd = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null;

    const [row] = await db
      .insert(subscription)
      .values({
        id: `${MANUAL_ID_PREFIX}${crypto.randomUUID()}`,
        userId,
        planId: `manual-grant-${duration}`,
        billingCycle: "monthly",
        status: "active",
        currentPeriodEnd,
      })
      .returning();

    await logAdminAction(session.user.id, userId, "grant_pro", { duration });
    return NextResponse.json({ subscription: row });
  }

  if (body.action === "revoke") {
    const [activeSub] = await db.select().from(subscription).where(activeSubWhere(userId));

    if (!activeSub) {
      return NextResponse.json({ error: "This user has no active subscription" }, { status: 404 });
    }

    // Real Razorpay subscription — cancel it there too, not just in our DB,
    // otherwise Razorpay keeps billing them next cycle. Admin revoke is
    // meant to take effect immediately (unlike the user's own self-serve
    // cancel), so no cancelAtCycleEnd here.
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

    await logAdminAction(session.user.id, userId, "revoke_pro", { previousSubscriptionId: activeSub.id });
    return NextResponse.json({ subscription: row });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
