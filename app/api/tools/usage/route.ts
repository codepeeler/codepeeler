import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getToolUsageForUser, getRecentToolsForUser } from "@/lib/tool-usage-server";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ tools: [], recent: [] });

  const [tools, recent] = await Promise.all([
    getToolUsageForUser(session.user.id),
    getRecentToolsForUser(session.user.id, 10),
  ]);

  return NextResponse.json({
    tools: tools.map((t) => ({ toolId: t.toolId, count: t.count, lastUsedAt: t.lastUsedAt })),
    recent: recent.map((t) => ({ toolId: t.toolId, count: t.count, lastUsedAt: t.lastUsedAt })),
  });
}
