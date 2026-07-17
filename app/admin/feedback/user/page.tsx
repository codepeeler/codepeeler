"use client";

import AdminFeedbackPanel from "@/components/admin/AdminFeedbackPanel";
import { useAdminFeedback } from "@/hooks/use-admin-feedback";

export default function UserFeedbackPage() {
  const { entries, loading, updateStatus } = useAdminFeedback("feedback");
  return (
    <AdminFeedbackPanel
      title="User feedback"
      emptyLabel="No feedback submitted yet."
      entries={entries}
      loading={loading}
      onUpdateStatus={updateStatus}
    />
  );
}
