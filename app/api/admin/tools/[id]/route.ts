import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { toolOverride } from "@/lib/db/schema";
import { TOOLS } from "@/lib/data/tools";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { id } = await params;
  if (!TOOLS.some((t) => t.id === id)) {
    return NextResponse.json({ error: "Unknown tool id" }, { status: 404 });
  }

  const body = (await req.json()) as { enabled?: boolean; featured?: boolean; beta?: boolean };

  const [existing] = await db.select().from(toolOverride).where(eq(toolOverride.id, id));

  const next = {
    enabled: body.enabled ?? existing?.enabled ?? true,
    featured: body.featured ?? existing?.featured ?? false,
    beta: body.beta ?? existing?.beta ?? false,
  };

  const [updated] = await db
    .insert(toolOverride)
    .values({ id, ...next, updatedAt: new Date() })
    .onConflictDoUpdate({ target: toolOverride.id, set: { ...next, updatedAt: new Date() } })
    .returning();

  await logAdminAction(session.user.id, null, "update_tool_override", { toolId: id, ...next });
  return NextResponse.json({ override: updated });
}
