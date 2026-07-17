import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { getToolsWithOverrides } from "@/lib/tool-overrides";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const tools = await getToolsWithOverrides();
  return NextResponse.json({ tools });
}
