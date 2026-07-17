import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { refundRequest } from "@/lib/db/schema";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { id } = await params;
  const body = (await req.json()) as { status?: string; adminNote?: string };

  const [updated] = await db
    .update(refundRequest)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(refundRequest.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Refund request not found" }, { status: 404 });

  await logAdminAction(session.user.id, updated.userId, "update_refund_request", { status: updated.status });
  return NextResponse.json({ refund: updated });
}
