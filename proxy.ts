import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Pages that require login. Middleware only checks "is there a session
// cookie at all" (fast, edge-safe, no DB hit) — actual plan/entitlement
// checks happen server-side in the page/route itself via getUserEntitlements().
const PROTECTED_PAGES = ["/dashboard", "/workspace", "/api-tester", "/snippets", "/collections", "/profile", "/support"];

// API routes that must never run for a logged-out caller — either because
// they cost money per call (AI) or do real work on the caller's behalf
// (proxying requests, scanning URLs).
const PROTECTED_API = ["/api/ai", "/api/proxy", "/api/security-check", "/api/subscription", "/api/collections", "/api/workflows", "/api/entitlements", "/api/support"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtectedPage = PROTECTED_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isProtectedApi = PROTECTED_API.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isProtectedPage && !isProtectedApi) return NextResponse.next();

  const sessionCookie = getSessionCookie(req);

  if (!sessionCookie) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspace/:path*",
    "/api-tester/:path*",
    "/snippets/:path*",
    "/collections/:path*",
    "/profile/:path*",
    "/support/:path*",
    "/api/ai/:path*",
    "/api/proxy/:path*",
    "/api/security-check/:path*",
    "/api/subscription/:path*",
    "/api/collections/:path*",
    "/api/workflows/:path*",
    "/api/entitlements/:path*",
    "/api/support/:path*",
  ],
};
