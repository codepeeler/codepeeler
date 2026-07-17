"use client";

import AdminSiteSettingsPanel from "@/components/admin/AdminSiteSettingsPanel";
import { useAdminSiteSettings } from "@/hooks/use-admin-site-settings";

export default function AdminSystemSettingsPage() {
  const siteSettings = useAdminSiteSettings();
  return (
    <AdminSiteSettingsPanel
      settings={siteSettings.settings}
      loading={siteSettings.loading}
      saving={siteSettings.saving}
      onSave={siteSettings.save}
    />
  );
}
