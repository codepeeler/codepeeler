"use client";

import AdminFeedbackPanel from "@/components/admin/AdminFeedbackPanel";
import { useAdminFeedback } from "@/hooks/use-admin-feedback";

export default function RatingsPage() {
  const { entries, loading, updateStatus } = useAdminFeedback("rating");
  return (
    <AdminFeedbackPanel
      title="Ratings"
      emptyLabel="No ratings submitted yet."
      entries={entries}
      loading={loading}
      onUpdateStatus={updateStatus}
    />
  );
}
