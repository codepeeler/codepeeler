"use client";

import AdminFeedbackPanel from "@/components/admin/AdminFeedbackPanel";
import { useAdminFeedback } from "@/hooks/use-admin-feedback";

export default function FeatureRequestsPage() {
  const { entries, loading, updateStatus } = useAdminFeedback("feature_request");
  return (
    <AdminFeedbackPanel
      title="Feature requests"
      emptyLabel="No feature requests yet."
      entries={entries}
      loading={loading}
      onUpdateStatus={updateStatus}
    />
  );
}
