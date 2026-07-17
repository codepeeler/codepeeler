import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { desc } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { ipRule } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const rules = await db.select().from(ipRule).orderBy(desc(ipRule.createdAt));
  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = (await req.json()) as { ip?: string; type?: "block" | "allow"; note?: string };
  if (!body.ip?.trim()) {
    return NextResponse.json({ error: "IP address is required" }, { status: 400 });
  }

  const [created] = await db
    .insert(ipRule)
    .values({
      id: crypto.randomUUID(),
      ip: body.ip.trim(),
      type: body.type === "allow" ? "allow" : "block",
      note: body.note?.trim() ?? "",
    })
    .onConflictDoNothing()
    .returning();

  if (!created) {
    return NextResponse.json({ error: "That IP already has a rule" }, { status: 409 });
  }

  await logAdminAction(session.user.id, null, "create_ip_rule", { ip: created.ip, type: created.type });
  return NextResponse.json({ rule: created });
}
