import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { supportTicket, supportTicketMessage, user } from "@/lib/db/schema";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { id } = await params;
  const [ticket] = await db
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
    .where(eq(supportTicket.id, id));

  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const messages = await db
    .select()
    .from(supportTicketMessage)
    .where(eq(supportTicketMessage.ticketId, id))
    .orderBy(asc(supportTicketMessage.createdAt));

  return NextResponse.json({ ticket, messages });
}

// Admin manually closes/reopens a ticket without replying (e.g. "not a real issue").
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { id } = await params;
  const { status } = (await req.json()) as { status: "open" | "pending" | "closed" };

  const [updated] = await db.update(supportTicket).set({ status, updatedAt: new Date() }).where(eq(supportTicket.id, id)).returning();
  if (!updated) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  await logAdminAction(session.user.id, updated.userId, "update_ticket_status", { ticketId: id, status });
  return NextResponse.json({ ticket: updated });
}
