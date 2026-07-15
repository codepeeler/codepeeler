import Link from "next/link";
import { Sparkles, Check } from "lucide-react";
import { useEntitlements } from "@/hooks/use-entitlements";
import { PLANS } from "@/lib/data/pricing";

/**
 * Real plan status card — pulls from useEntitlements() (which resolves the
 * user's actual `subscription` row server-side, see lib/entitlements.ts).
 * Replaces the old hardcoded "Free & Local / No account needed" card that
 * never reflected an actual account's plan or usage. A signed-up user with
 * no subscription row is Free by default (that's the plan system's existing
 * behaviour, not something this card has to set up) — Pro only shows once a
 * real active subscription exists.
 */
export default function PlanCard() {
  const { loading, entitlements, isPro } = useEntitlements();

  const planCopy = PLANS.find((p) => p.key === (isPro ? "pro" : "free"));
  const executionsUsed = entitlements?.usage.executions ?? 0;
  const executionsLimit = entitlements?.limits.executionsPerMonth ?? 0;

  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[linear-gradient(160deg,var(--primary-dim),transparent)] p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] text-[var(--primary)]">
          <Sparkles size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold">{loading ? "Loading…" : isPro ? "Pro Plan" : "Free Plan"}</div>
          <div className="text-[11px] text-[var(--text-faint)]">
            {loading ? "\u00A0" : `${executionsUsed.toLocaleString()} / ${executionsLimit.toLocaleString()} executions used`}
          </div>
        </div>
        {!loading && (
          <span className="flex-shrink-0 rounded-full bg-[color-mix(in_srgb,var(--success)_16%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--success)]">
            Active
          </span>
        )}
      </div>

      <ul className="mb-3 space-y-1.5">
        {(planCopy?.features ?? []).slice(0, 4).map((f) => (
          <li key={f} className="flex items-center gap-2 text-[12px] text-[var(--text-dim)]">
            <Check size={13} className="flex-shrink-0 text-[var(--success)]" />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={isPro ? "/workspace/settings" : "/pricing"}
        className="flex w-full items-center justify-center rounded-[9px] border border-[var(--border)] bg-[var(--card)] py-2 text-[12px] font-semibold text-[var(--text)] transition-colors duration-150 hover:bg-[var(--card-hover)]"
      >
        {isPro ? "Manage Plan" : "Upgrade to Pro"}
      </Link>
    </div>
  );
}
