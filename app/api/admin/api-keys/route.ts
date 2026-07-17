import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { desc } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { apiKey } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const keys = await db
    .select({
      id: apiKey.id,
      label: apiKey.label,
      keyPrefix: apiKey.keyPrefix,
      lastUsedAt: apiKey.lastUsedAt,
      revoked: apiKey.revoked,
      createdAt: apiKey.createdAt,
    })
    .from(apiKey)
    .orderBy(desc(apiKey.createdAt));

  return NextResponse.json({ keys });
}

/**
 * Returns the full plaintext key exactly once, in the response body — the
 * DB only ever stores a sha256 hash of it. Store it now, it can't be
 * shown again (same pattern as GitHub/Stripe token issuance).
 */
export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { label } = (await req.json().catch(() => ({}))) as { label?: string };
  if (!label?.trim()) {
    return NextResponse.json({ error: "Label is required" }, { status: 400 });
  }

  const fullKey = `cp_${crypto.randomBytes(24).toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(fullKey).digest("hex");

  const [created] = await db
    .insert(apiKey)
    .values({
      id: crypto.randomUUID(),
      label: label.trim(),
      keyPrefix: fullKey.slice(0, 11),
      keyHash,
      createdByUserId: session.user.id,
    })
    .returning();

  await logAdminAction(session.user.id, null, "create_api_key", { label: created.label });
  return NextResponse.json({ key: { ...created, fullKey } });
}
