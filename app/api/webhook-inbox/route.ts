import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomSlug(length = 10): string {
  return Array.from({ length }, () => SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)]).join("");
}

export async function POST(req: NextRequest) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          "Webhook Inbox isn't configured. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to your .env.local (see supabase/schema.sql for the one-time table setup).",
      },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}) as Record<string, unknown>);
  const rawName = typeof body?.name === "string" ? body.name.trim() : "";
  const name = rawName ? rawName.slice(0, 80) : "Untitled inbox";

  // Slug collisions are astronomically unlikely at 10 base36 chars, but retry a couple of
  // times anyway rather than surfacing a 500 to the user over pure bad luck.
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = randomSlug();
    const { data, error } = await admin.from("webhook_inboxes").insert({ slug, name }).select().single();
    if (!error && data) {
      return NextResponse.json({ id: data.id, slug: data.slug, name: data.name, createdAt: data.created_at });
    }
    if (error && !/duplicate/i.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Couldn't allocate a unique inbox slug — please try again." }, { status: 500 });
}
