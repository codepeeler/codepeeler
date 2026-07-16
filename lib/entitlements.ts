import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import { getUsageSnapshot, type UsageType } from "@/lib/usage";

/**
 * Single source of truth for "what can this plan do". Two kinds of gates:
 *  - Capability  = a feature is either on or off for the plan (boolean switch)
 *  - Limit       = a feature is on for everyone, but capped by a number per period
 *
 * Add a new premium sub-feature to any tool (existing or one of the 150 coming)
 * by: 1) adding its name to `Capability` below, 2) turning it on for the
 * plan(s) that should have it. Nothing else needs to change — the
 * `<CapabilityGate>` component and `useEntitlements()` hook both read from here.
 */

export type PlanKey = "free" | "pro";

export type Capability =
  | "ai-assist" // API Tester: AI request builder / test generator / explainer
  | "load-test" // API Tester: concurrent load testing
  | "github-sync" // API Tester: push/pull collections to a Gist
  | "security-check" // API Tester: TLS + header security scan
  | "multi-env"; // API Tester: more than 1 environment

export type Entitlements = {
  plan: PlanKey;
  capabilities: Capability[];
  limits: {
    maxEnvironments: number;
    maxWorkflows: number;
    maxCollections: number;
    executionsPerMonth: number;
    storageMB: number;
    aiCallsPerMonth: number;
  };
};

export const ENTITLEMENTS_BY_PLAN: Record<PlanKey, Entitlements> = {
  free: {
    plan: "free",
    capabilities: [],
    limits: {
      maxEnvironments: 1,
      maxWorkflows: 5,
      maxCollections: 2,
      executionsPerMonth: 100,
      storageMB: 100,
      aiCallsPerMonth: 0,
    },
  },
  pro: {
    plan: "pro",
    capabilities: ["ai-assist", "load-test", "github-sync", "security-check", "multi-env"],
    limits: {
      maxEnvironments: Infinity,
      maxWorkflows: Infinity,
      maxCollections: Infinity,
      executionsPerMonth: 10_000,
      storageMB: 10_000,
      // Real cost per call (LLM provider), so even Pro is capped — just much higher.
      // Tune this once real usage data comes in; not a hard product promise anywhere in copy.
      aiCallsPerMonth: 500,
    },
  },
};

// Razorpay subscription statuses that mean "this user currently has Pro access".
// "authenticated" covers the trial window: the mandate is authorized but the
// first real charge (start_at) hasn't happened yet — they should still get Pro.
const PRO_ACTIVE_STATUSES = ["authenticated", "active"];
export { PRO_ACTIVE_STATUSES };

export type BillingInfo = {
  subscriptionId: string;
  billingCycle: "monthly" | "yearly";
  status: string;
  currentPeriodEnd: string | null; // ISO string, null if not yet known
} | null;

/**
 * Resolves a user's plan from the subscription table, then returns their
 * full entitlements + current usage against the metered limits.
 * This is the ONLY place that should read the `subscription` table to decide
 * access — every route/component calls this, never queries `subscription` directly.
 */
export async function getUserEntitlements(userId: string): Promise<
  Entitlements & { usage: Record<UsageType, number>; billing: BillingInfo }
> {
  const [activeSub] = await db
    .select()
    .from(subscription)
    .where(and(eq(subscription.userId, userId), inArray(subscription.status, PRO_ACTIVE_STATUSES)));

  const plan: PlanKey = activeSub ? "pro" : "free";
  const entitlements = ENTITLEMENTS_BY_PLAN[plan];
  const usage = await getUsageSnapshot(userId);

  const billing: BillingInfo = activeSub
    ? {
        subscriptionId: activeSub.id,
        billingCycle: activeSub.billingCycle as "monthly" | "yearly",
        status: activeSub.status,
        currentPeriodEnd: activeSub.currentPeriodEnd ? activeSub.currentPeriodEnd.toISOString() : null,
      }
    : null;

  return { ...entitlements, usage, billing };
}

export function hasCapability(entitlements: Entitlements, capability: Capability): boolean {
  return entitlements.capabilities.includes(capability);
}
