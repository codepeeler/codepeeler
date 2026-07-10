import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * This route is meant to be hit by anything on the internet — Stripe, GitHub, a cron job, a
 * curl command — so it deliberately does NOT require auth. The only "secret" is the slug
 * itself, same trust model as webhook.site/RequestBin. Writes go through the service-role
 * client, which is the only thing with insert rights on webhook_requests (see supabase/schema.sql).
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

const MAX_BODY_CHARS = 200_000; // generous cap so one giant payload can't blow up storage/UI

async function capture(req: NextRequest, slug: string): Promise<NextResponse> {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Webhook Inbox isn't configured on this server." }, { status: 500, headers: CORS_HEADERS });
  }

  const { data: inbox, error: findErr } = await admin.from("webhook_inboxes").select("id").eq("slug", slug).maybeSingle();
  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500, headers: CORS_HEADERS });
  if (!inbox) return NextResponse.json({ error: "No such webhook inbox — check the URL." }, { status: 404, headers: CORS_HEADERS });

  const url = new URL(req.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    query[k] = v;
  });

  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    headers[k] = v;
  });

  let bodyText = "";
  try {
    bodyText = await req.text();
  } catch {
    bodyText = "";
  }
  const sizeBytes = bodyText ? new TextEncoder().encode(bodyText).length : 0;
  const truncatedBody = bodyText.length > MAX_BODY_CHARS ? bodyText.slice(0, MAX_BODY_CHARS) + `\n… (truncated, ${bodyText.length} chars total)` : bodyText;

  const { error: insertErr } = await admin.from("webhook_requests").insert({
    inbox_id: inbox.id,
    method: req.method,
    path: url.pathname,
    query,
    headers,
    body: truncatedBody || null,
    content_type: req.headers.get("content-type"),
    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
    size_bytes: sizeBytes,
  });
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500, headers: CORS_HEADERS });

  return NextResponse.json({ received: true }, { status: 200, headers: CORS_HEADERS });
}

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  return capture(req, slug);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  return capture(req, slug);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  return capture(req, slug);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  return capture(req, slug);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  return capture(req, slug);
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
