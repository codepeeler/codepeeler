import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { subscriptionId } = (await req.json()) as { subscriptionId: string };

  // Ownership check — never let a user cancel someone else's subscription
  // just because they know (or guess) its id.
  const [row] = await db
    .select()
    .from(subscription)
    .where(and(eq(subscription.id, subscriptionId), eq(subscription.userId, session.user.id)));

  if (!row) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  // cancelAtCycleEnd: true — matches the toast copy ("Pro access continues
  // until the period ends"). Razorpay's default (false) cancels immediately,
  // which would contradict that message.
  await razorpay.subscriptions.cancel(subscriptionId, true);
  // Intentionally not updating the DB row here — the subscription.cancelled
  // webhook is the source of truth and will flip the status shortly.

  return NextResponse.json({ ok: true });
}
