import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { ipRule } from "@/lib/db/schema";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { id } = await params;
  const [deleted] = await db.delete(ipRule).where(eq(ipRule.id, id)).returning();
  if (!deleted) return NextResponse.json({ error: "Rule not found" }, { status: 404 });

  await logAdminAction(session.user.id, null, "delete_ip_rule", { ip: deleted.ip });
  return NextResponse.json({ ok: true });
}
