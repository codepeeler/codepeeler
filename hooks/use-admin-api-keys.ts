"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";

export type ApiKeyRow = {
  id: string;
  label: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  revoked: boolean;
  createdAt: string;
};

export function useAdminApiKeys() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/api-keys");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't load API keys");
      setKeys(data.keys);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load API keys");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (label: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't create key");
      setJustCreatedKey(data.key.fullKey);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't create key");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/api-keys/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't revoke key");
      setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, revoked: true } : k)));
      toast("Key revoked");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't revoke key");
    }
  };

  return { keys, loading, saving, create, revoke, justCreatedKey, clearJustCreatedKey: () => setJustCreatedKey(null) };
}
