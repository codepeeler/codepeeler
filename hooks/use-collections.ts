"use client";

import { useCallback, useEffect, useState } from "react";
import { COLLECTION_ICON_MAP, DEFAULT_COLLECTION_ICON_KEY, type Collection } from "@/lib/data/collections";
import { formatTimeAgo } from "@/lib/utils";

type ApiCollectionRow = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  tags: string[];
  toolIds: string[];
  visibility: Collection["visibility"];
  starred: boolean;
  autoUpdate: boolean;
  allowDuplicate: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiWorkflowRow = {
  id: string;
  collectionId: string | null;
  name: string;
  status: "active" | "draft" | "paused";
  steps: number;
  lastRunAt: string | null;
  updatedAt: string;
};

export type NewCollectionInput = {
  name: string;
  desc?: string;
  icon?: string;
  color?: string;
  tags?: string[];
  toolIds?: string[];
  visibility?: Collection["visibility"];
};

export type CollectionPatch = Partial<{
  name: string;
  desc: string;
  icon: string;
  color: string;
  tags: string[];
  toolIds: string[];
  visibility: Collection["visibility"];
  starred: boolean;
  autoUpdate: boolean;
  allowDuplicate: boolean;
}>;

// Turns a raw DB row + this user's workflows into the UI-facing `Collection`
// shape components already render. `dataSize` / `executions` have no real
// tracking behind them yet (no per-collection storage or execution log), so
// rather than fabricate numbers those two are left out of the UI entirely
// (see app/collections/page.tsx + CollectionDetailsPanel) -- they're kept
// here only because the shared `Collection` type still declares them.
function decorate(row: ApiCollectionRow, workflows: ApiWorkflowRow[]): Collection {
  const own = workflows.filter((w) => w.collectionId === row.id);
  const createdAgo = formatTimeAgo(row.createdAt);
  const updatedAgo = formatTimeAgo(row.updatedAt);
  const recentlyUpdated = new Date(row.updatedAt).getTime() - new Date(row.createdAt).getTime() > 60_000;

  return {
    id: row.id,
    name: row.name,
    desc: row.desc,
    icon: COLLECTION_ICON_MAP[row.icon] ?? COLLECTION_ICON_MAP[DEFAULT_COLLECTION_ICON_KEY],
    color: row.color,
    tags: row.tags,
    workflows: own.length,
    tools: row.toolIds.length,
    dataSize: "—",
    executions: 0,
    owner: "me", // /api/collections only ever returns the signed-in user's own rows
    visibility: row.visibility,
    starred: row.starred,
    createdAgo,
    updatedAgo,
    autoUpdate: row.autoUpdate,
    allowDuplicate: row.allowDuplicate,
    toolIds: row.toolIds,
    workflowsList: own.map((w) => ({
      id: w.id,
      name: w.name,
      status: w.status,
      lastRun: formatTimeAgo(w.lastRunAt ?? w.updatedAt),
      steps: w.steps,
    })),
    activity: [
      ...(recentlyUpdated ? [{ id: `${row.id}-updated`, text: "Collection updated", time: updatedAgo }] : []),
      { id: `${row.id}-created`, text: "Collection created", time: createdAgo },
    ],
  };
}

export function useCollections() {
  const [rows, setRows] = useState<ApiCollectionRow[]>([]);
  const [workflows, setWorkflows] = useState<ApiWorkflowRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [collectionsRes, workflowsRes] = await Promise.all([
        fetch("/api/collections"),
        fetch("/api/workflows"),
      ]);
      const [collectionsData, workflowsData] = await Promise.all([
        collectionsRes.ok ? collectionsRes.json() : { collections: [] },
        workflowsRes.ok ? workflowsRes.json() : { workflows: [] },
      ]);
      setRows(collectionsData.collections ?? []);
      setWorkflows(workflowsData.workflows ?? []);
    } catch {
      setRows([]);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const collections = rows.map((row) => decorate(row, workflows));

  const createCollection = useCallback(async (input: NewCollectionInput) => {
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false as const, error: data.error ?? "Couldn't create collection", upgradeUrl: data.upgradeUrl };
    setRows((prev) => [data.collection, ...prev]);
    return { ok: true as const, collection: decorate(data.collection, workflows) };
  }, [workflows]);

  const patchCollection = useCallback(async (id: string, patch: CollectionPatch) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } as ApiCollectionRow : r))); // optimistic
    const res = await fetch(`/api/collections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      await load(); // revert to server truth on failure
      return { ok: false as const };
    }
    const data = await res.json();
    setRows((prev) => prev.map((r) => (r.id === id ? data.collection : r)));
    return { ok: true as const };
  }, [load]);

  const deleteCollection = useCallback(async (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id)); // optimistic
    const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
    if (!res.ok) await load();
    return { ok: res.ok };
  }, [load]);

  const duplicateCollection = useCallback(
    async (id: string) => {
      const original = rows.find((r) => r.id === id);
      if (!original) return { ok: false as const, error: "Collection not found" };
      // Copies collection metadata only -- workflows inside it are not cloned,
      // since duplicating those (and their canvas snapshots) is a separate,
      // bigger operation than this button implies. Flagged in chat.
      return createCollection({
        name: `${original.name} (Copy)`,
        desc: original.desc,
        icon: original.icon,
        color: original.color,
        tags: original.tags,
        toolIds: original.toolIds,
        visibility: original.visibility,
      });
    },
    [rows, createCollection]
  );

  return { collections, loading, createCollection, patchCollection, deleteCollection, duplicateCollection };
}
