"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";

export type DashboardData = {
  activeUsers30d: number;
  mrr: number;
  totalTools: number;
  dbStatus: { healthy: boolean; pingMs: number };
  signupsOverTime: { day: string; signups: number }[];
  toolRunsOverTime: { day: string; toolRuns: number }[];
  topTools: { id: string | null; name: string; runs: number; users: number }[];
  countryBreakdown: { country: string; count: number; pct: number }[];
  newUsers: { id: string; name: string; email: string; createdAt: string }[];
  recentActivity: { id: string; type: string; entityName: string | null; createdAt: string; userName: string; userEmail: string }[];
};

export function useAdminDashboard() {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Couldn't load dashboard");
      setData(json);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load dashboard");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading };
}
