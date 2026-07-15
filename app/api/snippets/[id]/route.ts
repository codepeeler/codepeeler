import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { snippet } from "@/lib/db/schema";

const PATCHABLE_FIELDS = ["title", "desc", "language", "category", "code", "tags"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const updates: Record<string, unknown> = {};
  for (const field of PATCHABLE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }
  if (typeof updates.title === "string") updates.title = (updates.title as string).trim();
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  updates.updatedAt = new Date();

  // Only the owner can edit — community-wide visibility on GET doesn't
  // extend to write access, same boundary /api/collections uses.
  const [row] = await db
    .update(snippet)
    .set(updates)
    .where(and(eq(snippet.id, id), eq(snippet.userId, session.user.id)))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ snippet: row });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  await db.delete(snippet).where(and(eq(snippet.id, id), eq(snippet.userId, session.user.id)));
  return NextResponse.json({ deleted: true });
}
