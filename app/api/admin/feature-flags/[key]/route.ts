import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { featureFlag } from "@/lib/db/schema";

type Body = { enabled?: boolean; description?: string };

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { key } = await params;
  const body = (await req.json()) as Body;

  const [flag] = await db
    .update(featureFlag)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(featureFlag.key, key))
    .returning();

  if (!flag) {
    return NextResponse.json({ error: "Flag not found" }, { status: 404 });
  }

  await logAdminAction(session.user.id, null, "update_feature_flag", { key, ...body });
  return NextResponse.json({ flag });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { key } = await params;
  await db.delete(featureFlag).where(eq(featureFlag.key, key));
  await logAdminAction(session.user.id, null, "delete_feature_flag", { key });
  return NextResponse.json({ ok: true });
}
