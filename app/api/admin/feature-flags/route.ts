import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { featureFlag } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  const flags = await db.select().from(featureFlag);
  return NextResponse.json({ flags });
}

type Body = { key: string; description?: string };

export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { key, description } = (await req.json()) as Body;
  const cleanKey = key?.trim().toLowerCase().replace(/\s+/g, "-");
  if (!cleanKey) {
    return NextResponse.json({ error: "Flag key is required" }, { status: 400 });
  }

  const [flag] = await db
    .insert(featureFlag)
    .values({ key: cleanKey, description: description?.trim() || null })
    .onConflictDoNothing()
    .returning();

  if (!flag) {
    return NextResponse.json({ error: "A flag with this key already exists" }, { status: 409 });
  }

  await logAdminAction(session.user.id, null, "create_feature_flag", { key: cleanKey });
  return NextResponse.json({ flag });
}
