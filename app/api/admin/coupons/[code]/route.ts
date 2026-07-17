import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { coupon } from "@/lib/db/schema";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { code } = await params;
  const { active } = (await req.json()) as { active: boolean };

  const [updated] = await db.update(coupon).set({ active }).where(eq(coupon.code, code)).returning();
  if (!updated) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  await logAdminAction(session.user.id, null, active ? "activate_coupon" : "deactivate_coupon", { code });
  return NextResponse.json({ coupon: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { code } = await params;
  await db.delete(coupon).where(eq(coupon.code, code));
  await logAdminAction(session.user.id, null, "delete_coupon", { code });
  return NextResponse.json({ ok: true });
}
