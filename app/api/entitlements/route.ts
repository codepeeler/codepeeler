import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserEntitlements } from "@/lib/entitlements";

// Single endpoint every client component reads plan/limits/usage from —
// see hooks/use-entitlements.ts. Keeps "how do we know what a user can do"
// server-authoritative instead of trusting anything from the browser.
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const entitlements = await getUserEntitlements(session.user.id);
  return NextResponse.json(entitlements);
}
