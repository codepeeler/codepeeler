import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { supportTicket, user } from "@/lib/db/schema";

// List all tickets, newest-updated first, optionally filtered by status.
export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status");

  const rows = await db
    .select({
      id: supportTicket.id,
      subject: supportTicket.subject,
      status: supportTicket.status,
      createdAt: supportTicket.createdAt,
      updatedAt: supportTicket.updatedAt,
      userId: supportTicket.userId,
      userName: user.name,
      userEmail: user.email,
    })
    .from(supportTicket)
    .innerJoin(user, eq(supportTicket.userId, user.id))
    .orderBy(desc(supportTicket.updatedAt));

  const tickets = status ? rows.filter((r) => r.status === status) : rows;
  return NextResponse.json({ tickets });
}
