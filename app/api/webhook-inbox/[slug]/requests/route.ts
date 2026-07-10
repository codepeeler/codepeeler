import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Webhook Inbox isn't configured." }, { status: 500 });

  const { data: inbox, error: findErr } = await admin.from("webhook_inboxes").select("id").eq("slug", slug).maybeSingle();
  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });
  if (!inbox) return NextResponse.json({ error: "No such inbox." }, { status: 404 });

  const { error } = await admin.from("webhook_requests").delete().eq("inbox_id", inbox.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cleared: true });
}
