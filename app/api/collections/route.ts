import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { collection } from "@/lib/db/schema";
import { getUserEntitlements } from "@/lib/entitlements";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const rows = await db.select().from(collection).where(eq(collection.userId, session.user.id));
  return NextResponse.json({ collections: rows });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    desc?: string;
    icon?: string;
    color?: string;
    tags?: string[];
    toolIds?: string[];
    visibility?: string;
  };
  if (!body.name?.trim()) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  const entitlements = await getUserEntitlements(session.user.id);
  const existing = await db.select().from(collection).where(eq(collection.userId, session.user.id));

  if (existing.length >= entitlements.limits.maxCollections) {
    return NextResponse.json(
      {
        error: `Free plan is limited to ${entitlements.limits.maxCollections} collections. Upgrade to Pro for unlimited collections.`,
        upgradeUrl: "/pricing",
      },
      { status: 402 }
    );
  }

  const [row] = await db
    .insert(collection)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      name: body.name.trim(),
      desc: body.desc?.trim() ?? "",
      icon: body.icon ?? "folder",
      color: body.color ?? "var(--primary)",
      tags: body.tags ?? [],
      toolIds: body.toolIds ?? [],
      visibility: body.visibility ?? "Private",
    })
    .returning();

  return NextResponse.json({ collection: row }, { status: 201 });
}
