import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { feedbackEntry } from "@/lib/db/schema";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { id } = await params;
  const { status } = (await req.json()) as { status?: string };

  const [updated] = await db
    .update(feedbackEntry)
    .set({ status })
    .where(eq(feedbackEntry.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

  await logAdminAction(session.user.id, updated.userId, "update_feedback_status", { status: updated.status });
  return NextResponse.json({ entry: updated });
}
