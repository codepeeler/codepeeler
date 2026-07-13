import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workflow } from "@/lib/db/schema";
import { getUserEntitlements } from "@/lib/entitlements";
import { checkUsageLimit, incrementUsage } from "@/lib/usage";

// This is the real enforcement point for "100 executions/month" (free) /
// "10,000/month" (Pro) from the pricing page. The actual run/transform logic
// stays client-side in providers/workflow-provider.tsx — this route is
// called right before/after a run to gate + count it, not to execute it.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const [wf] = await db
    .select()
    .from(workflow)
    .where(and(eq(workflow.id, id), eq(workflow.userId, session.user.id)));
  if (!wf) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const entitlements = await getUserEntitlements(session.user.id);
  const gate = await checkUsageLimit(session.user.id, "executions", entitlements.limits.executionsPerMonth);
  if (!gate.allowed) {
    return NextResponse.json(
      {
        error: `Monthly execution limit reached (${gate.used}/${gate.limit}). Resets next month.`,
        upgradeUrl: "/pricing",
      },
      { status: 402 }
    );
  }

  const used = await incrementUsage(session.user.id, "executions");
  await db.update(workflow).set({ lastRunAt: new Date() }).where(eq(workflow.id, id));

  return NextResponse.json({ allowed: true, used, limit: entitlements.limits.executionsPerMonth });
}
