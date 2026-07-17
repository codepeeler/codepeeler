import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { session } from "@/lib/db/schema";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminSession = await requireAdminSession(req.headers);
  if (!adminSession) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;
  const [target] = await db.select({ userId: session.userId }).from(session).where(eq(session.id, id));
  if (!target) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  await db.delete(session).where(eq(session.id, id));
  await logAdminAction(adminSession.user.id, target.userId, "revoke_session", { sessionId: id });

  return NextResponse.json({ ok: true });
}
