"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";

export type Coupon = {
  code: string;
  description: string | null;
  extraTrialDays: number;
  maxRedemptions: number | null;
  timesRedeemed: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
};

export function useAdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load coupons");
      setCoupons(data.coupons);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load coupons");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const createCoupon = async (input: { code: string; description: string; extraTrialDays: number; maxRedemptions: number | null }) => {
    setPending(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't create coupon");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't create coupon");
    } finally {
      setPending(false);
    }
  };

  const toggleCoupon = async (code: string, active: boolean) => {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/coupons/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't update coupon");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't update coupon");
    } finally {
      setPending(false);
    }
  };

  const deleteCoupon = async (code: string) => {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/coupons/${code}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't delete coupon");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't delete coupon");
    } finally {
      setPending(false);
    }
  };

  return { coupons, loading, pending, createCoupon, toggleCoupon, deleteCoupon };
}
