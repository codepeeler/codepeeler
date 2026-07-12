import { NextRequest, NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { razorpay, PLAN_MAP, type BillingCycle } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";

// Statuses that mean "this user already has a subscription in flight or
// live" — don't let them start a second one on top of it.
const BLOCKING_STATUSES = ["created", "authenticated", "active", "pending", "paused", "halted"];

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { billingCycle } = (await req.json()) as { billingCycle: BillingCycle };
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

  try {
    const razorpaySub = await razorpay.subscriptions.create({
      plan_id: plan.planId,
      customer_notify: 1,
      total_count: plan.totalCount,
      notes: { userId: session.user.id },
    });

    // Row starts as "created" — the webhook flips it to "active" once the
    // customer actually completes payment in the checkout widget.
    await db.insert(subscription).values({
      id: razorpaySub.id,
      userId: session.user.id,
      planId: plan.planId,
      billingCycle,
      status: razorpaySub.status,
    });

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
