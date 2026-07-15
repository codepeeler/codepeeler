import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recordToolUsageServer } from "@/lib/tool-usage-server";
import { recordActivity } from "@/lib/activity";
import { TOOLS } from "@/lib/data/tools";

/**
 * Fire-and-forget: ToolHeader calls this once per tool-page visit. Silently
 * no-ops for signed-out visitors (their visits still count locally via
 * lib/tool-usage.ts's localStorage tracker) — this is the real, per-account
 * counterpart used once someone is logged in.
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ ok: true, tracked: false });

  const body = (await req.json().catch(() => ({}))) as { toolId?: string };
  const toolId = body.toolId;
  const tool = TOOLS.find((t) => t.id === toolId);
  if (!tool) {
    return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
  }

  await recordToolUsageServer(session.user.id, tool.id);
  await recordActivity(session.user.id, "tool_use", tool.id, tool.name);
  return NextResponse.json({ ok: true, tracked: true });
}
