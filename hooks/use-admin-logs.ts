"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";

export type AdminLogRow = {
  admin: { id: string; name: string; email: string } | null;
  actionCount: number;
  lastAction: string;
  lastActionAt: string;
};

export function useAdminLogs() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/admin-logs");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Couldn't load admin logs");
        setAdmins(data.admins);
      } catch (err) {
        toast(err instanceof Error ? err.message : "Couldn't load admin logs");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  return { admins, loading };
}
