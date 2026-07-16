"use client";

import { useEffect, useState, useCallback } from "react";
import type { Capability, Entitlements, BillingInfo } from "@/lib/entitlements";
import type { UsageType } from "@/lib/usage";

type EntitlementsResponse = Entitlements & { usage: Record<UsageType, number>; billing: BillingInfo; storageUsedBytes: number };

type State = {
  data: EntitlementsResponse | null;
  loading: boolean;
};

// Every component that needs to know "is this user free or pro / has this
// capability / how close are they to a limit" calls this ONE hook — nothing
// else fetches /api/entitlements directly. Free plan is the safe default
// while loading / on error, so the UI never briefly "flashes" unlocked.
export function useEntitlements() {
  const [state, setState] = useState<State>({ data: null, loading: true });

  const refresh = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    fetch("/api/entitlements")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: EntitlementsResponse | null) => setState({ data, loading: false }))
      .catch(() => setState({ data: null, loading: false }));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const plan = state.data?.plan ?? "free";
  const isPro = plan === "pro";

  const hasCapability = (capability: Capability) => !!state.data?.capabilities.includes(capability);

  const isAtLimit = (usageType: UsageType, limitKey: keyof Entitlements["limits"]) => {
    if (!state.data) return false;
    const used = state.data.usage[usageType] ?? 0;
    const limit = state.data.limits[limitKey];
    return used >= limit;
  };

  return {
    loading: state.loading,
    entitlements: state.data,
    billing: state.data?.billing ?? null,
    plan,
    isPro,
    hasCapability,
    isAtLimit,
    refresh,
  };
}
