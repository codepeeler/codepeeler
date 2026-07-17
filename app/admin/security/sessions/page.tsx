"use client";

import AdminSessionsTable from "@/components/admin/AdminSessionsTable";
import { useAdminSessions } from "@/hooks/use-admin-sessions";

export default function AdminSessionsPage() {
  const { sessions, loading, page, setPage, revoke, revokingId } = useAdminSessions();
  return (
    <AdminSessionsTable sessions={sessions} loading={loading} page={page} setPage={setPage} onRevoke={revoke} revokingId={revokingId} />
  );
}
