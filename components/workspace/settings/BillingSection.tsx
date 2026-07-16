"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { useEntitlements } from "@/hooks/use-entitlements";
import { PLANS } from "@/lib/data/pricing";
import { useToast } from "@/providers/toast-provider";

function UsageBar({ label, used, limit, unit }: { label: string; used: number; limit: number; unit?: string }) {
  const isUnlimited = !Number.isFinite(limit);
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[12px]">
        <span className="text-[var(--text-dim)]">{label}</span>
        <span className="font-medium text-[var(--text)]">
          {used.toLocaleString()}
          {unit} / {isUnlimited ? "Unlimited" : `${limit.toLocaleString()}${unit ?? ""}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-soft)]">
          <div
            className={`h-full rounded-full ${pct >= 90 ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Billing lives inside Settings (not a standalone page) — matches how
 * Linear, Vercel, and GitHub organize account settings: Plan & Billing is
 * one section among Appearance/Notifications/etc, not a separate top-level
 * route. Pulls real data from useEntitlements() (server-authoritative via
 * /api/entitlements) instead of any hardcoded "Free & Local" copy.
 */
export default function BillingSection() {
  const { toast } = useToast();
  const { loading, entitlements, billing, isPro, refresh } = useEntitlements();
  const [cancelling, setCancelling] = useState(false);

  const planCopy = PLANS.find((p) => p.key === (isPro ? "pro" : "free"));
  const executionsUsed = entitlements?.usage.executions ?? 0;
  const executionsLimit = entitlements?.limits.executionsPerMonth ?? 0;
  const aiCallsUsed = entitlements?.usage["ai-calls"] ?? 0;
  const aiCallsLimit = entitlements?.limits.aiCallsPerMonth ?? 0;
  const storageLimitMB = entitlements?.limits.storageMB ?? 0;
  const storageUsedMB = (entitlements?.storageUsedBytes ?? 0) / (1024 * 1024);

  const handleCancel = async () => {
    if (!billing) return;
    if (!window.confirm("Cancel your Pro subscription? You'll keep Pro access until the end of the current billing period.")) {
      return;
    }
    setCancelling(true);
    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: billing.subscriptionId }),
      });
      if (!res.ok) throw new Error();
      toast("Subscription cancelled — Pro access continues until the period ends");
      refresh();
    } catch {
      toast("Couldn't cancel subscription — try again");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="mb-7">
      <h2 className="text-[14px] font-semibold">Plan & Billing</h2>
      <p className="mt-0.5 text-[12px] text-[var(--text-faint)]">
        Your current plan, usage, and billing details
      </p>

      <div className="mt-3 rounded-[12px] border border-[var(--border)] bg-[linear-gradient(160deg,var(--primary-dim),transparent)] p-4">
        {loading ? (
          <div className="flex items-center gap-2 py-2 text-[12.5px] text-[var(--text-faint)]">
            <Loader2 size={14} className="animate-spin" /> Loading plan details…
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] text-[var(--primary)]">
                  <Sparkles size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[14px] font-semibold">
                    {planCopy?.name ?? "Free"} Plan
                    {isPro && (
                      <span className="rounded-full bg-[color-mix(in_srgb,var(--success)_16%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--success)]">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[var(--text-faint)]">
                    {isPro
                      ? `₹${billing?.billingCycle === "yearly" ? planCopy?.price.yearly : planCopy?.price.monthly}/month · billed ${billing?.billingCycle}`
                      : "No credit card required"}
                  </div>
                </div>
              </div>

              {isPro ? (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex items-center gap-1.5 rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[12px] font-semibold text-[var(--danger)] transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] disabled:opacity-60"
                >
                  {cancelling && <Loader2 size={12} className="animate-spin" />}
                  Cancel subscription
                </button>
              ) : (
                <Link
                  href="/pricing"
                  className="flex items-center gap-1.5 rounded-[9px] bg-[var(--primary)] px-3 py-2 text-[12px] font-semibold text-white transition-opacity duration-150 hover:opacity-90"
                >
                  Upgrade to Pro
                </Link>
              )}
            </div>

            {isPro && billing && (
              <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 rounded-[9px] bg-[var(--card)]/60 px-3 py-2.5 text-[12px]">
                <div>
                  <span className="text-[var(--text-faint)]">Subscribed since</span>{" "}
                  <span className="font-medium text-[var(--text)]">{formatDate(billing.startedAt)}</span>
                </div>
                <div>
                  <span className="text-[var(--text-faint)]">
                    {billing.status === "authenticated" ? "Trial ends" : "Next billing date"}
                  </span>{" "}
                  <span className="font-medium text-[var(--text)]">{formatDate(billing.currentPeriodEnd)}</span>
                </div>
                <div>
                  <span className="text-[var(--text-faint)]">Subscription ID</span>{" "}
                  <span className="font-[family-name:var(--font-mono)] text-[var(--text-dim)]">{billing.subscriptionId}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <UsageBar label="Executions this month" used={executionsUsed} limit={executionsLimit} />
              {aiCallsLimit > 0 && (
                <UsageBar label="AI calls this month" used={aiCallsUsed} limit={aiCallsLimit} />
              )}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="text-[var(--text-dim)]">Storage used</span>
                  <span className="font-medium text-[var(--text)]">
                    {storageUsedMB < 1 ? `${(storageUsedMB * 1024).toFixed(0)} KB` : `${storageUsedMB.toFixed(1)} MB`} /{" "}
                    {storageLimitMB.toLocaleString()} MB
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-soft)]">
                  <div
                    className={`h-full rounded-full ${
                      storageUsedMB / Math.max(storageLimitMB, 1) >= 0.9 ? "bg-[var(--danger)]" : "bg-[var(--primary)]"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((storageUsedMB / Math.max(storageLimitMB, 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <Link
              href="/pricing"
              className="mt-4 flex items-center gap-1 text-[12px] font-medium text-[var(--primary)]"
            >
              {isPro ? "Compare plans" : "See full plan comparison"} <ExternalLink size={11} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
