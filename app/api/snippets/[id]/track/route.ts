import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { snippet } from "@/lib/db/schema";
import { recordActivity } from "@/lib/activity";

/**
 * Fire-and-forget counters: { type: "view" } when a snippet is opened,
 * { type: "use" } when its code is copied. No per-user dedup (a view/use
 * table would be needed for that) — same trade-off the original mock data
 * made with plain incrementing counts.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { type?: "view" | "use" };
  if (body.type !== "view" && body.type !== "use") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const column = body.type === "view" ? snippet.views : snippet.uses;
  const [row] = await db
    .update(snippet)
    .set({ [body.type === "view" ? "views" : "uses"]: sql`${column} + 1` })
    .where(eq(snippet.id, id))
    .returning({ title: snippet.title });

  await recordActivity(session.user.id, body.type === "view" ? "snippet_view" : "snippet_use", id, row?.title ?? null);

  return NextResponse.json({ ok: true });
}
