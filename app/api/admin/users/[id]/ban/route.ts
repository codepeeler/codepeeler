import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id: userId } = await params;
  const { banned } = (await req.json().catch(() => ({}))) as { banned?: boolean };

  if (typeof banned !== "boolean") {
    return NextResponse.json({ error: "Invalid banned state" }, { status: 400 });
  }

  // Prevent banning oneself so admins don't accidentally lock themselves out
  if (userId === session.user.id && banned) {
    return NextResponse.json({ error: "You cannot ban yourself" }, { status: 400 });
  }

  const [updatedUser] = await db
    .update(user)
    .set({ banned, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning();

  if (!updatedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: updatedUser });
}
