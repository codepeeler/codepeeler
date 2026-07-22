import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

/**
 * Vercel injects `x-vercel-ip-country` (a 2-letter code, e.g. "IN") on every
 * request at the edge — no third-party geo-IP service needed. Only present
 * in production on Vercel; locally (or on other hosts) it's absent and this
 * becomes a no-op, so country data only backfills once deployed. Called
 * once per session from SiteStatusGate — cheap, and only writes when the
 * value actually changed.
 */
export async function GET(req: NextRequest) {
  const country = req.headers.get("x-vercel-ip-country");
  if (!country) return NextResponse.json({ country: null });

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ country });

  const [row] = await db.select({ country: user.country }).from(user).where(eq(user.id, session.user.id));
  if (row?.country !== country) {
    await db.update(user).set({ country }).where(eq(user.id, session.user.id));
  }

  return NextResponse.json({ country });
}
