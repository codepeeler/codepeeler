"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";

export type FeatureFlag = { key: string; enabled: boolean; description: string | null; updatedAt: string };

export function useAdminFeatureFlags() {
  const { toast } = useToast();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/feature-flags");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load flags");
      setFlags(data.flags);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load flags");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const createFlag = async (key: string, description: string) => {
    setPending(true);
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't create flag");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't create flag");
    } finally {
      setPending(false);
    }
  };

  const toggleFlag = async (key: string, enabled: boolean) => {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/feature-flags/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't update flag");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't update flag");
    } finally {
      setPending(false);
    }
  };

  const deleteFlag = async (key: string) => {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/feature-flags/${key}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't delete flag");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't delete flag");
    } finally {
      setPending(false);
    }
  };

  return { flags, loading, pending, createFlag, toggleFlag, deleteFlag };
}
