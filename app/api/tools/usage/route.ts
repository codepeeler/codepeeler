import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getToolUsageForUser } from "@/lib/tool-usage-server";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ tools: [] });

  const tools = await getToolUsageForUser(session.user.id);
  return NextResponse.json({
    tools: tools.map((t) => ({ toolId: t.toolId, count: t.count, lastUsedAt: t.lastUsedAt })),
  });
}
