"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useEntitlements } from "@/hooks/use-entitlements";

/**
 * Shown in the topbar for logged-in users only (returns null while loading
 * or logged out — useEntitlements() gives null data on a 401). Keeps the
 * current plan + how close the user is to their execution limit always
 * visible, instead of only surfacing it when something gets blocked.
 */
export default function PlanBadge() {
  const { loading, entitlements, isPro } = useEntitlements();

  if (loading || !entitlements) return null;

  if (isPro) {
    return (
      <span className="flex h-[34px] items-center gap-1 rounded-lg bg-[var(--accent)]/10 px-2.5 text-[11.5px] font-bold text-[var(--accent)]">
        <Sparkles size={12} /> Pro
      </span>
    );
  }

  const used = entitlements.usage.executions;
  const limit = entitlements.limits.executionsPerMonth;

  return (
    <Link
      href="/pricing"
      className="flex h-[34px] items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 text-[11.5px] font-semibold text-[var(--text-dim)] hover:border-[var(--text-faint)] hover:text-[var(--text)]"
      title={`${used}/${limit} executions used this month`}
    >
      Free · {used}/{limit}
    </Link>
  );
}
