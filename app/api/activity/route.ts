import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRecentActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ activity: [] });

  const events = await getRecentActivity(session.user.id, 15);
  return NextResponse.json({ activity: events });
}
