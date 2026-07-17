"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";

export type RefundRequest = {
  id: string;
  subscriptionId: string | null;
  userId: string;
  amount: number | null;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string } | null;
};

export function useAdminRefunds() {
  const { toast } = useToast();
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/refunds");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load refund requests");
      setRefunds(data.refunds);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load refund requests");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (input: { email: string; subscriptionId?: string; amount?: number; reason?: string }) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't create refund request");
      toast("Refund request logged");
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't create refund request");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: RefundRequest["status"]) => {
    try {
      const res = await fetch(`/api/admin/refunds/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't update refund");
      setRefunds((prev) => prev.map((r) => (r.id === id ? { ...r, ...data.refund } : r)));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't update refund");
    }
  };

  return { refunds, loading, saving, create, updateStatus };
}
