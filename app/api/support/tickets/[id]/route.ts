import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { supportTicket, supportTicketMessage } from "@/lib/db/schema";

// Ticket detail + full thread — only if it belongs to the caller.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const [ticket] = await db.select().from(supportTicket).where(eq(supportTicket.id, id));
  if (!ticket || ticket.userId !== session.user.id) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const messages = await db
    .select()
    .from(supportTicketMessage)
    .where(eq(supportTicketMessage.ticketId, id))
    .orderBy(asc(supportTicketMessage.createdAt));

  return NextResponse.json({ ticket, messages });
}
