import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { usage } from "@/lib/db/schema";
import type { UsageType } from "@/lib/usage";

type Body = { type: UsageType | "all" };

/**
 * Deletes the usage row(s) instead of zeroing them — same effect (getUsage()
 * treats "no row" as 0, see lib/usage.ts) with one less field to keep in sync.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id: userId } = await params;
  const { type } = (await req.json()) as Body;

  if (type === "all") {
    await db.delete(usage).where(eq(usage.userId, userId));
  } else {
    await db.delete(usage).where(and(eq(usage.userId, userId), eq(usage.type, type)));
  }

  return NextResponse.json({ ok: true });
}
