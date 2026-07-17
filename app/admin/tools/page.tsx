"use client";

import AdminToolsPanel from "@/components/admin/AdminToolsPanel";
import { useAdminTools } from "@/hooks/use-admin-tools";

export default function AdminToolsPage() {
  const { tools, loading, query, setQuery, update } = useAdminTools();
  return <AdminToolsPanel tools={tools} loading={loading} query={query} setQuery={setQuery} onUpdate={update} />;
}
