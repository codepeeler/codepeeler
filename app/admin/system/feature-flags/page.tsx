"use client";

import AdminFeatureFlagsPanel from "@/components/admin/AdminFeatureFlagsPanel";
import { useAdminFeatureFlags } from "@/hooks/use-admin-feature-flags";

export default function AdminFeatureFlagsPage() {
  const featureFlags = useAdminFeatureFlags();
  return (
    <AdminFeatureFlagsPanel
      flags={featureFlags.flags}
      loading={featureFlags.loading}
      pending={featureFlags.pending}
      onCreate={featureFlags.createFlag}
      onToggle={featureFlags.toggleFlag}
      onDelete={featureFlags.deleteFlag}
    />
  );
}
