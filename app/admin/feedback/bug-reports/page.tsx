"use client";

import AdminFeedbackPanel from "@/components/admin/AdminFeedbackPanel";
import { useAdminFeedback } from "@/hooks/use-admin-feedback";

export default function BugReportsPage() {
  const { entries, loading, updateStatus } = useAdminFeedback("bug_report");
  return (
    <AdminFeedbackPanel
      title="Bug reports"
      emptyLabel="No bug reports yet."
      entries={entries}
      loading={loading}
      onUpdateStatus={updateStatus}
    />
  );
}
