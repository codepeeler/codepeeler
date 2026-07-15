import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { collection } from "@/lib/db/schema";
import { recordActivity } from "@/lib/activity";

const PATCHABLE_FIELDS = [
  "name",
  "desc",
  "icon",
  "color",
  "tags",
  "toolIds",
  "visibility",
  "starred",
  "autoUpdate",
  "allowDuplicate",
] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const updates: Record<string, unknown> = {};
  for (const field of PATCHABLE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }
  if (typeof updates.name === "string") updates.name = (updates.name as string).trim();
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  updates.updatedAt = new Date();

  const [row] = await db
    .update(collection)
    .set(updates)
    .where(and(eq(collection.id, id), eq(collection.userId, session.user.id)))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await recordActivity(session.user.id, "collection_update", row.id, row.name);

  return NextResponse.json({ collection: row });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  await db.delete(collection).where(and(eq(collection.id, id), eq(collection.userId, session.user.id)));
  return NextResponse.json({ deleted: true });
}
