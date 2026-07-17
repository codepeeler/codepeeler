"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";

export type SiteSettings = {
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  announcementEnabled: boolean;
  announcementMessage: string | null;
  announcementLink: string | null;
};

export function useAdminSiteSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load settings");
      setSettings(data.settings);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load settings");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (patch: Partial<SiteSettings>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't save settings");
      setSettings(data.settings);
      toast("Settings saved");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't save settings");
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, saving, save };
}
