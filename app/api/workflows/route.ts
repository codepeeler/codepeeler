import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workflow } from "@/lib/db/schema";
import { getUserEntitlements } from "@/lib/entitlements";
import { recordActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const rows = await db.select().from(workflow).where(eq(workflow.userId, session.user.id));
  return NextResponse.json({ workflows: rows });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name, collectionId } = (await req.json().catch(() => ({}))) as { name?: string; collectionId?: string };
  if (!name?.trim()) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  const entitlements = await getUserEntitlements(session.user.id);
  const existing = await db.select().from(workflow).where(eq(workflow.userId, session.user.id));

  if (existing.length >= entitlements.limits.maxWorkflows) {
    return NextResponse.json(
      {
        error: `Free plan is limited to ${entitlements.limits.maxWorkflows} workflows. Upgrade to Pro for unlimited workflows.`,
        upgradeUrl: "/pricing",
      },
      { status: 402 }
    );
  }

  const [row] = await db
    .insert(workflow)
    .values({ id: crypto.randomUUID(), userId: session.user.id, name: name.trim(), collectionId: collectionId ?? null })
    .returning();

  await recordActivity(session.user.id, "workflow_create", row.id, row.name);

  return NextResponse.json({ workflow: row }, { status: 201 });
}
