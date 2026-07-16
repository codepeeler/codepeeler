import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { toolFavorite } from "@/lib/db/schema";
import { TOOLS } from "@/lib/data/tools";

/**
 * Toggles a pin: if the (userId, toolId) row exists, delete it; otherwise
 * insert it. Same shape as /api/snippets/[id]/bookmark — a favorite isn't a
 * boolean on any shared table, it lives in its own per-user join table.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ toolId: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { toolId } = await params;
  const tool = TOOLS.find((t) => t.id === toolId);
  if (!tool) return NextResponse.json({ error: "Unknown tool" }, { status: 400 });

  const existing = await db
    .select({ id: toolFavorite.id })
    .from(toolFavorite)
    .where(and(eq(toolFavorite.userId, session.user.id), eq(toolFavorite.toolId, tool.id)));

  if (existing.length > 0) {
    await db
      .delete(toolFavorite)
      .where(and(eq(toolFavorite.userId, session.user.id), eq(toolFavorite.toolId, tool.id)));
    return NextResponse.json({ favorited: false });
  }

  await db.insert(toolFavorite).values({
    id: `${session.user.id}:${tool.id}`,
    userId: session.user.id,
    toolId: tool.id,
  });
  return NextResponse.json({ favorited: true });
}
