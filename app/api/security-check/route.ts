import { NextRequest, NextResponse } from "next/server";
import tls from "node:tls";
import { auth } from "@/lib/auth";
import { getUserEntitlements, hasCapability } from "@/lib/entitlements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TlsInfo {
  protocol: string | null;
  cipher: string | null;
  subject: string | null;
  issuer: string | null;
  validFrom: string | null;
  validTo: string | null;
  daysUntilExpiry: number | null;
  authorized: boolean;
  authorizationError: string | null;
}

function checkTls(hostname: string, port: number): Promise<TlsInfo> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (info: TlsInfo) => {
      if (settled) return;
      settled = true;
      resolve(info);
    };
    const socket = tls.connect({ host: hostname, port, servername: hostname, timeout: 8000, rejectUnauthorized: false }, () => {
      const cert = socket.getPeerCertificate();
      const protocol = socket.getProtocol();
      const cipher = socket.getCipher();
      const validTo = cert?.valid_to ? new Date(cert.valid_to) : null;
      const asString = (v: string | string[] | undefined): string | null => (Array.isArray(v) ? v[0] || null : v || null);
      finish({
        protocol: protocol || null,
        cipher: cipher?.name || null,
        subject: asString(cert?.subject?.CN),
        issuer: asString(cert?.issuer?.O) || asString(cert?.issuer?.CN),
        validFrom: cert?.valid_from || null,
        validTo: cert?.valid_to || null,
        daysUntilExpiry: validTo ? Math.round((validTo.getTime() - Date.now()) / 86_400_000) : null,
        authorized: socket.authorized,
        authorizationError: socket.authorized ? null : String(socket.authorizationError || "Certificate not trusted"),
      });
      socket.end();
    });
    socket.on("error", (err) => finish(emptyTlsInfo(err.message)));
    socket.on("timeout", () => {
      socket.destroy();
      finish(emptyTlsInfo("Connection timed out"));
    });
  });
}

function emptyTlsInfo(error: string): TlsInfo {
  return { protocol: null, cipher: null, subject: null, issuer: null, validFrom: null, validTo: null, daysUntilExpiry: null, authorized: false, authorizationError: error };
}

const SECURITY_HEADERS: { key: string; label: string; why: string }[] = [
  { key: "strict-transport-security", label: "Strict-Transport-Security", why: "Forces browsers to use HTTPS for future requests to this host." },
  { key: "content-security-policy", label: "Content-Security-Policy", why: "Restricts what scripts/styles/resources can load — the main defense against XSS." },
  { key: "x-content-type-options", label: "X-Content-Type-Options", why: "Should be 'nosniff' — stops browsers guessing a file's type in a way attackers can abuse." },
  { key: "x-frame-options", label: "X-Frame-Options", why: "Prevents this page being embedded in a clickjacking iframe (CSP frame-ancestors also covers this)." },
  { key: "referrer-policy", label: "Referrer-Policy", why: "Controls how much of this URL leaks to other sites via the Referer header." },
  { key: "permissions-policy", label: "Permissions-Policy", why: "Restricts access to browser features like camera, microphone, and geolocation." },
];

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const entitlements = await getUserEntitlements(session.user.id);
  if (!hasCapability(entitlements, "security-check")) {
    return NextResponse.json({ error: "Security Health Check is a Pro feature.", upgradeUrl: "/pricing" }, { status: 402 });
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!body.url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(body.url);
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return NextResponse.json({ error: "Only http:// and https:// URLs are supported." }, { status: 400 });
  }

  const isHttps = parsed.protocol === "https:";
  const port = parsed.port ? Number(parsed.port) : isHttps ? 443 : 80;

  const [tlsInfo, headerResult] = await Promise.all([
    isHttps ? checkTls(parsed.hostname, port) : Promise.resolve(null),
    (async () => {
      try {
        const res = await fetch(parsed.toString(), { method: "GET", signal: AbortSignal.timeout(8000) });
        const headers: Record<string, string> = {};
        res.headers.forEach((v, k) => {
          headers[k] = v;
        });
        return { status: res.status as number | null, headers, error: null as string | null };
      } catch (e) {
        return { status: null, headers: {} as Record<string, string>, error: e instanceof Error ? e.message : "Request failed" };
      }
    })(),
  ]);

  const headerFindings = SECURITY_HEADERS.map((h) => ({ ...h, present: !!headerResult.headers[h.key], value: headerResult.headers[h.key] || null }));

  // A quick heuristic, not a substitute for a full audit — same spirit as SSL Labs' grade,
  // scored ourselves so there's no third-party API involved (their ToS forbids commercial use
  // without permission, which ruled that route out entirely).
  let score = 0;
  const maxScore = isHttps ? 9 : 6;
  if (isHttps) score += 1;
  if (tlsInfo?.authorized) score += 1;
  if (tlsInfo?.daysUntilExpiry != null && tlsInfo.daysUntilExpiry > 14) score += 1;
  score += headerFindings.filter((h) => h.present).length;
  const pct = maxScore ? score / maxScore : 0;
  const grade = pct >= 0.9 ? "A" : pct >= 0.75 ? "B" : pct >= 0.55 ? "C" : pct >= 0.3 ? "D" : "F";

  return NextResponse.json({
    url: parsed.toString(),
    isHttps,
    tls: tlsInfo,
    status: headerResult.status,
    fetchError: headerResult.error,
    headerFindings,
    grade,
  });
}
