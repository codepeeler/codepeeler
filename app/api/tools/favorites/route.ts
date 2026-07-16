import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFavoriteToolsForUser } from "@/lib/tool-favorites-server";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ favorites: [] });

  const favorites = await getFavoriteToolsForUser(session.user.id);
  return NextResponse.json({ favorites: favorites.map((f) => f.toolId) });
}
