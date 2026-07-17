import { NextRequest, NextResponse } from "next/server";
import { eq, and, inArray, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { razorpay, PLAN_MAP, type BillingCycle } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { subscription, coupon } from "@/lib/db/schema";

// Statuses that mean "this user already has a subscription in flight or
// live" — don't let them start a second one on top of it.
const BLOCKING_STATUSES = ["created", "authenticated", "active", "pending", "paused", "halted"];

// Pricing page advertises a 14-day free trial. Razorpay itself has no
// separate "trial" concept for subscriptions — the way to get one is to
// pass `start_at` as a future Unix timestamp: the customer still
// authorizes the mandate now (small auth hold, auto-reversed), but the
// first real charge doesn't happen until start_at. Razorpay requires
// start_at to be at least a few hours ahead of now, so pad slightly past
// exactly 14 days to avoid clock-skew edge cases near the boundary.
const TRIAL_DAYS = 14;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { billingCycle, couponCode } = (await req.json()) as { billingCycle: BillingCycle; couponCode?: string };
  const plan = PLAN_MAP[billingCycle];
  if (!plan) {
    return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
  }
  if (!plan.planId) {
    return NextResponse.json(
      { error: `Missing Razorpay plan id for "${billingCycle}" — check RAZORPAY_PLAN_${billingCycle.toUpperCase()} in .env.local` },
      { status: 500 }
    );
  }

  // Guard against duplicate clicks / double-submits creating two subscriptions.
  const [existing] = await db
    .select()
    .from(subscription)
    .where(and(eq(subscription.userId, session.user.id), inArray(subscription.status, BLOCKING_STATUSES)));

  if (existing) {
    return NextResponse.json(
      { error: "You already have a subscription in progress or active. Refresh the page to see its status." },
      { status: 409 }
    );
  }

  // Coupons extend the trial (see lib/db/schema.ts comment on `coupon` for
  // why this isn't a price discount) — validate it here rather than
  // trusting whatever the client sends.
  let extraTrialDays = 0;
  let redeemedCode: string | null = null;
  if (couponCode?.trim()) {
    const code = couponCode.trim().toUpperCase();
    const [found] = await db.select().from(coupon).where(eq(coupon.code, code));
    if (!found) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }
    if (!found.active) {
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    }
    if (found.expiresAt && found.expiresAt < new Date()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }
    if (found.maxRedemptions !== null && found.timesRedeemed >= found.maxRedemptions) {
      return NextResponse.json({ error: "This coupon has reached its redemption limit" }, { status: 400 });
    }
    extraTrialDays = found.extraTrialDays;
    redeemedCode = found.code;
  }

  const trialStartAt = Math.floor(Date.now() / 1000) + (TRIAL_DAYS + extraTrialDays) * 24 * 60 * 60;

  try {
    const razorpaySub = await razorpay.subscriptions.create({
      plan_id: plan.planId,
      customer_notify: 1,
      total_count: plan.totalCount,
      start_at: trialStartAt,
      notes: { userId: session.user.id, couponCode: redeemedCode ?? "" },
    });

    // Row starts as "created" — the webhook flips it to "active" once the
    // customer actually completes payment in the checkout widget.
    // currentPeriodEnd is set to trialStartAt up front — Razorpay doesn't
    // return current_end until the subscription is actually "active" (i.e.
    // after the trial ends and the first real charge happens), so without
    // this the "Trial ends" / "Renews" date would show a dash the whole
    // trial. The webhook overwrites it with the real current_end once
    // billing actually starts.
    await db.insert(subscription).values({
      id: razorpaySub.id,
      userId: session.user.id,
      planId: plan.planId,
      billingCycle,
      status: razorpaySub.status,
      currentPeriodEnd: new Date(trialStartAt * 1000),
    });

    if (redeemedCode) {
      await db
        .update(coupon)
        .set({ timesRedeemed: sql`${coupon.timesRedeemed} + 1` })
        .where(eq(coupon.code, redeemedCode));
    }

    return NextResponse.json({
      subscriptionId: razorpaySub.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    // Razorpay SDK errors usually carry a .error.description with the real reason
    // (bad key, invalid plan_id, etc.) — surface that instead of a blank crash.
    const message = err?.error?.description || err?.message || "Couldn't create subscription";
    console.error("Razorpay subscription create failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
