import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";

function verifySignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  // Lengths must match before timingSafeEqual — it throws on mismatched
  // buffer lengths instead of just returning false.
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

const STATUS_BY_EVENT: Record<string, string> = {
  // Fires once the customer completes mandate setup at checkout — with a
  // trial (start_at in the future) this is what actually happens right
  // after payment, *before* any real charge. Without this mapping the row
  // stays stuck on "created" for the whole 14-day trial.
  "subscription.authenticated": "authenticated",
  "subscription.activated": "active",
  "subscription.charged": "active",
  "subscription.completed": "completed",
  "subscription.cancelled": "cancelled",
  "subscription.halted": "halted",
  "subscription.paused": "paused",
  "subscription.pending": "pending",
};

export async function POST(req: NextRequest) {
  // IMPORTANT: read the raw text BEFORE parsing. Razorpay's signature is
  // computed over the exact raw bytes it sent — re-serializing a parsed
  // JSON object (JSON.stringify(await req.json())) can reorder keys/change
  // whitespace and silently break verification. Always hash the raw text.
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event as string;
  const sub = payload.payload?.subscription?.entity;

  // Not every webhook event carries a subscription entity (e.g. pure
  // payment events) — ack with 200 so Razorpay doesn't retry, just skip.
  if (!sub?.id) {
    return NextResponse.json({ received: true });
  }

  const newStatus = STATUS_BY_EVENT[event];
  if (newStatus) {
    await db
      .update(subscription)
      .set({
        status: newStatus,
        currentPeriodEnd: sub.current_end ? new Date(sub.current_end * 1000) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(subscription.id, sub.id));
  }

  return NextResponse.json({ received: true });
}
