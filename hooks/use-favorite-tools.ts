"use client";

import { useEffect, useState, useCallback } from "react";
import { TOOLS, type Tool } from "@/lib/data/tools";

/**
 * Single source of truth for "which tools has this user pinned" — the real
 * per-account counterpart to the old hardcoded PINNED_TOOL_IDS list. Backed
 * by /api/tools/favorites (GET, list) and /api/tools/[toolId]/favorite
 * (POST, toggle) — same shape as the snippet bookmark routes. Both the
 * dashboard's "Favorite Tools" section and the Favorites page use this same
 * hook so a pin/unpin made in one place is reflected after either's own
 * refresh (same trade-off as useEntitlements()/useSnippetsData() — no
 * cross-tab push).
 */
export function useFavoriteTools() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/tools/favorites");
      const data = res.ok ? await res.json() : { favorites: [] };
      setFavoriteIds(data.favorites ?? []);
    } catch {
      setFavoriteIds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isFavorite = (toolId: string) => favoriteIds.includes(toolId);

  const toggle = async (toolId: string) => {
    // Optimistic flip, corrected from the response (or rolled back on failure).
    const wasFavorite = favoriteIds.includes(toolId);
    setFavoriteIds((ids) => (wasFavorite ? ids.filter((id) => id !== toolId) : [...ids, toolId]));

    try {
      const res = await fetch(`/api/tools/${toolId}/favorite`, { method: "POST" });
      if (!res.ok) throw new Error("toggle failed");
      const data = (await res.json()) as { favorited: boolean };
      setFavoriteIds((ids) => {
        const has = ids.includes(toolId);
        if (data.favorited && !has) return [...ids, toolId];
        if (!data.favorited && has) return ids.filter((id) => id !== toolId);
        return ids;
      });
    } catch {
      load(); // roll back to server state on failure
    }
  };

  const favoriteTools: Tool[] = favoriteIds
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is Tool => !!t);

  return { loading, favoriteIds, favoriteTools, isFavorite, toggle, refresh: load };
}
