"use client";

import AdminApiKeysPanel from "@/components/admin/AdminApiKeysPanel";
import { useAdminApiKeys } from "@/hooks/use-admin-api-keys";

export default function AdminApiKeysPage() {
  const { keys, loading, saving, create, revoke, justCreatedKey, clearJustCreatedKey } = useAdminApiKeys();
  return (
    <AdminApiKeysPanel
      keys={keys}
      loading={loading}
      saving={saving}
      onCreate={create}
      onRevoke={revoke}
      justCreatedKey={justCreatedKey}
      onClearJustCreated={clearJustCreatedKey}
    />
  );
}
