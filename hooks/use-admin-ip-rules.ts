"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";

export type IpRule = { id: string; ip: string; type: "block" | "allow"; note: string; createdAt: string };

export function useAdminIpRules() {
  const { toast } = useToast();
  const [rules, setRules] = useState<IpRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ip-rules");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load IP rules");
      setRules(data.rules);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load IP rules");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (ip: string, type: "block" | "allow", note: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ip-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, type, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't add rule");
      setRules((prev) => [data.rule, ...prev]);
      toast("IP rule added");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't add rule");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ip-rules/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't remove rule");
      setRules((prev) => prev.filter((r) => r.id !== id));
      toast("IP rule removed");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't remove rule");
    }
  };

  return { rules, loading, saving, create, remove };
}
