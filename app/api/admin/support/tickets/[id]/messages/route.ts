import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { supportTicket, supportTicketMessage, user } from "@/lib/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_123456789");

// Admin replies on a ticket — sets status to "pending" (waiting on the
// user) and emails the user so they don't have to keep checking the site.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { id } = await params;
  const [ticket] = await db.select().from(supportTicket).where(eq(supportTicket.id, id));
  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const { message } = (await req.json()) as { message: string };
  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const [row] = await db
    .insert(supportTicketMessage)
    .values({ id: crypto.randomUUID(), ticketId: id, senderId: session.user.id, senderRole: "admin", message: message.trim() })
    .returning();

  await db.update(supportTicket).set({ status: "pending", updatedAt: new Date() }).where(eq(supportTicket.id, id));

  const [ticketOwner] = await db.select({ email: user.email }).from(user).where(eq(user.id, ticket.userId));
  if (ticketOwner) {
    const { error } = await resend.emails.send({
      from: "CodePeeler Support <noreply@codepeeler.in>",
      to: ticketOwner.email,
      replyTo: "support@codepeeler.dev",
      subject: `Re: ${ticket.subject}`,
      html: `<p>${message.trim().replace(/\n/g, "<br/>")}</p><p style="color:#888;font-size:12px">Reply on the CodePeeler Support page to continue this conversation.</p>`,
    });
    if (error) console.error("Support reply email failed:", error);
  }

  await logAdminAction(session.user.id, ticket.userId, "reply_ticket", { ticketId: id });
  return NextResponse.json({ message: row });
}
