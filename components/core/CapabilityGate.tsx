"use client";

import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEntitlements } from "@/hooks/use-entitlements";
import type { Capability } from "@/lib/entitlements";

/**
 * Wrap any premium feature's UI with this. While entitlements are loading,
 * or if the user lacks the capability, it renders a locked upsell card
 * instead of `children` — the real feature code never mounts for a free
 * user, so there's no way to see/trigger it via devtools either.
 *
 * <CapabilityGate capability="ai-assist" label="AI Assistant">
 *   <AiAssistantPanel ... />
 * </CapabilityGate>
 */
export function CapabilityGate({
  capability,
  label,
  description,
  children,
}: {
  capability: Capability;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  const { loading, hasCapability } = useEntitlements();

  if (loading) {
    return <div className="flex min-h-[160px] items-center justify-center text-[12.5px] text-[var(--text-faint)]">Loading…</div>;
  }

  if (!hasCapability(capability)) {
    return <UpgradeCard label={label} description={description} />;
  }

  return <>{children}</>;
}

export function UpgradeCard({ label, description }: { label: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-10 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
        <Lock size={18} />
      </div>
      <div>
        <div className="text-[13.5px] font-bold">{label} is a Pro feature</div>
        {description && <div className="mx-auto mt-1 max-w-[280px] text-[12px] text-[var(--text-dim)]">{description}</div>}
      </div>
      <Link
        href="/pricing"
        className="mt-1 flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-[12.5px] font-bold text-white hover:opacity-90"
      >
        <Sparkles size={13} /> Upgrade to Pro
      </Link>
    </div>
  );
}

/** Small inline "Pro" badge for buttons/tiles that should look locked without hiding them entirely. */
export function ProBadge() {
  return (
    <span className="ml-1 inline-flex items-center rounded-[8px] bg-[var(--accent)]/10 px-1.5 py-[1px] text-[9.5px] font-bold uppercase tracking-wide text-[var(--accent)]">
      Pro
    </span>
  );
}
