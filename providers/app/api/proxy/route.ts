import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ProxyPayload {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  timeout?: number;
}

/**
 * Relays a request server-side so the API Tester can reach targets that don't send
 * CORS headers (most regular websites and many private APIs) — the same reason Postman's
 * desktop app "just works": it isn't running inside a browser's CORS sandbox.
 *
 * Client-side fetch stays the default path; this route is only used as an automatic
 * fallback when a direct browser fetch fails, or when the user explicitly opts into
 * "Always send through server proxy" in request settings.
 */
export async function POST(req: NextRequest) {
  let payload: ProxyPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ proxyError: "Invalid proxy request payload" }, { status: 400 });
  }

  const { method, url, headers, body, timeout = 30000 } = payload;

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ proxyError: "Invalid target URL" }, { status: 400 });
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ proxyError: "Only http/https URLs can be proxied" }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(timeout, 60000));
  const start = Date.now();

  try {
    const outgoingHeaders = { ...headers };
    delete outgoingHeaders["host"];
    delete outgoingHeaders["Host"];

    const res = await fetch(target.toString(), {
      method,
      headers: outgoingHeaders,
      body: !["GET", "HEAD"].includes(method.toUpperCase()) && body !== undefined ? body : undefined,
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timer);

    const bodyText = await res.text();
    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => { responseHeaders[k] = v; });

    return NextResponse.json({
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      headers: responseHeaders,
      bodyText,
      duration: Date.now() - start,
      finalUrl: res.url || target.toString(),
    });
  } catch (e: any) {
    clearTimeout(timer);
    const message = e?.name === "AbortError" ? `Proxied request timed out after ${timeout}ms` : e?.message || "Proxied request failed";
    return NextResponse.json({ proxyError: message, duration: Date.now() - start }, { status: 502 });
  }
}
