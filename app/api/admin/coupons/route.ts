import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { coupon } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  const coupons = await db.select().from(coupon).orderBy(desc(coupon.createdAt));
  return NextResponse.json({ coupons });
}

type Body = {
  code: string;
  description?: string;
  extraTrialDays: number;
  maxRedemptions?: number | null;
  expiresAt?: string | null;
};

export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = (await req.json()) as Body;
  const code = body.code?.trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
  }
  if (!Number.isFinite(body.extraTrialDays) || body.extraTrialDays < 0) {
    return NextResponse.json({ error: "Extra trial days must be a positive number" }, { status: 400 });
  }

  const [created] = await db
    .insert(coupon)
    .values({
      code,
      description: body.description?.trim() || null,
      extraTrialDays: body.extraTrialDays,
      maxRedemptions: body.maxRedemptions ?? null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    })
    .onConflictDoNothing()
    .returning();

  if (!created) {
    return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
  }

  await logAdminAction(session.user.id, null, "create_coupon", { code, extraTrialDays: body.extraTrialDays });
  return NextResponse.json({ coupon: created });
}
