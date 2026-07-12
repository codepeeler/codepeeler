import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { razorpay, PLAN_MAP, type BillingCycle } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";

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
}
