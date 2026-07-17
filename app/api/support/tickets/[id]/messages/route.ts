import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { supportTicket, supportTicketMessage } from "@/lib/db/schema";

// User replies on their own ticket. Replying on a closed ticket reopens it
// — from the user's side there's no separate "reopen" action, just "reply".
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const [ticket] = await db.select().from(supportTicket).where(eq(supportTicket.id, id));
  if (!ticket || ticket.userId !== session.user.id) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const { message } = (await req.json()) as { message: string };
  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const [row] = await db
    .insert(supportTicketMessage)
    .values({ id: crypto.randomUUID(), ticketId: id, senderId: session.user.id, senderRole: "user", message: message.trim() })
    .returning();

  await db.update(supportTicket).set({ status: "open", updatedAt: new Date() }).where(eq(supportTicket.id, id));

  return NextResponse.json({ message: row });
}
