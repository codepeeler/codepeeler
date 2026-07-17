"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";

export type AdminAccount = { id: string; name: string; email: string; createdAt: string };

export function useAdminAccounts() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/admin-accounts");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load admin accounts");
      setAdmins(data.admins);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load admin accounts");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const promote = async (email: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/admin-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't promote user");
      toast("User promoted to admin");
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't promote user");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const demote = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't demote admin");
      toast("Admin demoted");
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't demote admin");
    }
  };

  return { admins, loading, saving, promote, demote };
}
