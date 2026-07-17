import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { apiKey } from "@/lib/db/schema";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { id } = await params;
  const [updated] = await db.update(apiKey).set({ revoked: true }).where(eq(apiKey.id, id)).returning();
  if (!updated) return NextResponse.json({ error: "Key not found" }, { status: 404 });

  await logAdminAction(session.user.id, null, "revoke_api_key", { label: updated.label });
  return NextResponse.json({ ok: true });
}
