import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const admins = await db
    .select({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt })
    .from(user)
    .where(eq(user.role, "admin"))
    .orderBy(desc(user.createdAt));

  return NextResponse.json({ admins });
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  const cleanEmail = email?.trim().toLowerCase();
  if (!cleanEmail) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const [target] = await db.select({ id: user.id }).from(user).where(eq(user.email, cleanEmail));
  if (!target) {
    return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
  }

  const [updated] = await db.update(user).set({ role: "admin", updatedAt: new Date() }).where(eq(user.id, target.id)).returning();
  await logAdminAction(session.user.id, target.id, "promote_admin");

  return NextResponse.json({ admin: updated });
}
