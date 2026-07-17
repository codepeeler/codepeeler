"use client";

import AdminAccountsPanel from "@/components/admin/AdminAccountsPanel";
import { useAdminAccounts } from "@/hooks/use-admin-accounts";

export default function AdminAccountsPage() {
  const { admins, loading, saving, promote, demote } = useAdminAccounts();
  return <AdminAccountsPanel admins={admins} loading={loading} saving={saving} onPromote={promote} onDemote={demote} />;
}
