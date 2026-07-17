import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { supportTicket, supportTicketMessage } from "@/lib/db/schema";

// List the caller's own tickets, newest first.
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const tickets = await db
    .select()
    .from(supportTicket)
    .where(eq(supportTicket.userId, session.user.id))
    .orderBy(desc(supportTicket.updatedAt));

  return NextResponse.json({ tickets });
}

// Open a new ticket with its first message in one call.
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { subject, message } = (await req.json()) as { subject: string; message: string };
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const [ticket] = await db
    .insert(supportTicket)
    .values({ id: crypto.randomUUID(), userId: session.user.id, subject: subject.trim() })
    .returning();

  await db.insert(supportTicketMessage).values({
    id: crypto.randomUUID(),
    ticketId: ticket.id,
    senderId: session.user.id,
    senderRole: "user",
    message: message.trim(),
  });

  return NextResponse.json({ ticket });
}
