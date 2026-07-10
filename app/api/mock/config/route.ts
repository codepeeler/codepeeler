import { NextRequest, NextResponse } from "next/server";
import { getMockStore, setMockStore } from "@/lib/api-tester/mock-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    setMockStore(Array.isArray(body.servers) ? body.servers : []);
    return NextResponse.json({ ok: true, count: getMockStore().length });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid mock config payload" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ servers: getMockStore() });
}
