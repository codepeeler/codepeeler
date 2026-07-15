import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { snippetBookmark } from "@/lib/db/schema";

/**
 * Toggles a bookmark: if the (snippetId, userId) row exists, delete it;
 * otherwise insert it. Bookmarks aren't a boolean on `snippet` (that table
 * is shared across every viewer) — they live in their own join table.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;

  const existing = await db
    .select({ id: snippetBookmark.id })
    .from(snippetBookmark)
    .where(and(eq(snippetBookmark.snippetId, id), eq(snippetBookmark.userId, session.user.id)));

  if (existing.length > 0) {
    await db.delete(snippetBookmark).where(and(eq(snippetBookmark.snippetId, id), eq(snippetBookmark.userId, session.user.id)));
    return NextResponse.json({ bookmarked: false });
  }

  await db.insert(snippetBookmark).values({
    id: crypto.randomUUID(),
    snippetId: id,
    userId: session.user.id,
  });
  return NextResponse.json({ bookmarked: true });
}
