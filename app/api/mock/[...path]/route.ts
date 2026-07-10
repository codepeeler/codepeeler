import { NextRequest, NextResponse } from "next/server";
import { getMockStore } from "@/lib/api-tester/mock-store";
import type { MockEndpoint } from "@/lib/api-tester/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

/** Matches a pattern like "/users/:id" or "/users/*" against an actual path, returning captured :params or null on no match. */
function matchPath(pattern: string, actual: string): Record<string, string> | null {
  const pParts = pattern.split("/").filter(Boolean);
  const aParts = actual.split("/").filter(Boolean);
  const params: Record<string, string> = {};
  for (let i = 0; i < pParts.length; i++) {
    const p = pParts[i];
    if (p === "*") return params;
    if (p.startsWith(":")) { params[p.slice(1)] = aParts[i] ?? ""; continue; }
    if (p !== aParts[i]) return null;
  }
  if (pParts.length !== aParts.length) return null;
  return params;
}

async function handle(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  if (req.method === "OPTIONS") return new NextResponse(null, { status: 204, headers: CORS_HEADERS });

  const { path } = await context.params;
  const segments = path || [];
  const serverId = segments[0];
  const actualPath = "/" + segments.slice(1).join("/");

  const server = getMockStore().find((s) => s.id === serverId);
  if (!server) {
    return NextResponse.json({ mockError: `No mock server with id "${serverId}". Push your config from the API Tester's Mocks tab first.` }, { status: 404, headers: CORS_HEADERS });
  }
  if (!server.enabled) {
    return NextResponse.json({ mockError: `Mock server "${server.name}" is turned off.` }, { status: 503, headers: CORS_HEADERS });
  }

  const method = req.method.toUpperCase();
  let matched: MockEndpoint | null = null;
  for (const ep of server.endpoints) {
    if (!ep.enabled || ep.method !== method) continue;
    if (matchPath(ep.path, actualPath)) { matched = ep; break; }
  }

  if (!matched) {
    return NextResponse.json(
      {
        mockError: `No mock endpoint for ${method} ${actualPath} on "${server.name}"`,
        available: server.endpoints.filter((e) => e.enabled).map((e) => `${e.method} ${e.path}`),
      },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  if (matched.delayMs > 0) await new Promise((r) => setTimeout(r, Math.min(matched!.delayMs, 15000)));

  const headers: Record<string, string> = { ...CORS_HEADERS };
  matched.headers.filter((h) => h.enabled && h.key).forEach((h) => { headers[h.key] = h.value; });
  if (!Object.keys(headers).some((h) => h.toLowerCase() === "content-type")) headers["Content-Type"] = "application/json";

  return new NextResponse(matched.body, { status: matched.statusCode, headers });
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE, handle as HEAD, handle as OPTIONS };
