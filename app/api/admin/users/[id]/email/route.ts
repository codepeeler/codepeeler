import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_123456789");

type Body = { subject: string; message: string };

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id: userId } = await params;
  const { subject, message } = (await req.json()) as Body;

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const [targetUser] = await db.select().from(user).where(eq(user.id, userId));
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Plain-paragraph email — message is admin-authored free text, split on
  // blank lines into <p> tags so line breaks render instead of collapsing.
  const html = message
    .trim()
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
    .join("\n");

  const { data, error } = await resend.emails.send({
    from: "CodePeeler Support <noreply@codepeeler.in>",
    to: targetUser.email,
    replyTo: "support@codepeeler.dev",
    subject: subject.trim(),
    html,
  });

  if (error) {
    console.error("Admin email send failed:", error);
    return NextResponse.json({ error: "Couldn't send email" }, { status: 500 });
  }

  await logAdminAction(session.user.id, userId, "send_email", { subject: subject.trim() });
  return NextResponse.json({ ok: true, id: data?.id });
}
