"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { type Snippet, type SnippetFilterKey, type SnippetLanguage } from "@/lib/data/snippets";
import { useToast } from "@/providers/toast-provider";

export type SortKey = "latest" | "rating" | "views" | "uses" | "title";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "latest", label: "Latest" },
  { key: "rating", label: "Top Rated" },
  { key: "views", label: "Most Viewed" },
  { key: "uses", label: "Most Used" },
  { key: "title", label: "Title (A–Z)" },
];

export type SnippetStats = {
  totalSnippets: string;
  totalUses: string;
  contributors: string;
  avgRating: string;
  avgRatingSub: string;
};

type ApiSnippet = Snippet & { createdAt: string };
type PopularTag = { label: string; count: string };
type TrendingSnippet = { id: string; title: string; author: string; uses: string };

const EMPTY_STATS: SnippetStats = {
  totalSnippets: "0",
  totalUses: "0",
  contributors: "0",
  avgRating: "—",
  avgRatingSub: "from 0 reviews",
};

/**
 * All Snippets page state, filtering/sorting, and handlers live here.
 * DesktopSnippetsView and MobileSnippetsView each call this directly, so
 * the list of snippets a user sees, search results, and every action
 * (bookmark, create, clear filters) behave identically on both — only the
 * layout around them differs. Same pattern as useDashboardData().
 *
 * Unlike the old mock-data version, `list` now comes from GET /api/snippets
 * (real, shared across every user) and every mutation (create, bookmark,
 * open/use) calls the matching API route rather than just touching local
 * state.
 */
export function useSnippetsData() {
  const { toast } = useToast();
  const [list, setList] = useState<ApiSnippet[]>([]);
  const [stats, setStats] = useState<SnippetStats>(EMPTY_STATS);
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [trendingSnippets, setTrendingSnippets] = useState<TrendingSnippet[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<SnippetFilterKey>("featured");
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<SnippetLanguage | "all">("all");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("latest");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [mineTab, setMineTab] = useState<"mine" | "bookmarked" | "recent" | "drafts" | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/snippets");
      if (!res.ok) throw new Error("Failed to load snippets");
      const data = await res.json();
      setList(data.snippets ?? []);
      setStats(data.stats ?? EMPTY_STATS);
      setPopularTags(data.popularTags ?? []);
      setTrendingSnippets(data.trendingSnippets ?? []);
    } catch {
      toast("Couldn't load snippets — try refreshing");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () => ({
      mine: list.filter((s) => s.mine).length,
      bookmarked: list.filter((s) => s.bookmarked).length,
      recent: Math.min(list.length, 15),
      drafts: 0, // no draft state on real snippets yet — every save is published
    }),
    [list]
  );

  const toggleBookmark = async (id: string) => {
    setList((prev) => prev.map((s) => (s.id === id ? { ...s, bookmarked: !s.bookmarked } : s)));
    try {
      const res = await fetch(`/api/snippets/${id}/bookmark`, { method: "POST" });
      if (!res.ok) throw new Error();
    } catch {
      setList((prev) => prev.map((s) => (s.id === id ? { ...s, bookmarked: !s.bookmarked } : s)));
      toast("Couldn't update bookmark");
    }
  };

  const handleOpen = (s: Snippet) => {
    toast(`Opening "${s.title}"…`);
    setList((prev) => prev.map((row) => (row.id === s.id ? { ...row, views: row.views + 1 } : row)));
    fetch(`/api/snippets/${s.id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "view" }),
    }).catch(() => {});
  };

  const handleUse = (s: Snippet) => {
    setList((prev) => prev.map((row) => (row.id === s.id ? { ...row, uses: row.uses + 1 } : row)));
    fetch(`/api/snippets/${s.id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "use" }),
    }).catch(() => {});
  };

  const createSnippet = async (payload: {
    title: string;
    desc: string;
    language: SnippetLanguage;
    category: string;
    code: string;
    tags: string[];
  }) => {
    try {
      const res = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data.error ?? "Couldn't create snippet");
        return false;
      }
      const data = await res.json();
      setList((prev) => [data.snippet, ...prev]);
      toast("Snippet published");
      return true;
    } catch {
      toast("Couldn't create snippet — try again");
      return false;
    }
  };

  const deleteSnippet = async (id: string) => {
    const prev = list;
    setList((p) => p.filter((s) => s.id !== id));
    try {
      const res = await fetch(`/api/snippets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Snippet deleted");
    } catch {
      setList(prev);
      toast("Couldn't delete snippet");
    }
  };

  const updateSnippet = async (id: string, updates: Partial<Pick<Snippet, "title" | "desc" | "language" | "category" | "code" | "tags">>) => {
    const prev = list;
    setList((p) => p.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    try {
      const res = await fetch(`/api/snippets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      toast("Snippet updated");
      return true;
    } catch {
      setList(prev);
      toast("Couldn't save changes");
      return false;
    }
  };

  const clearAllFilters = () => {
    setQuery("");
    setLanguage("all");
    setCategory("all");
    setActiveTag(null);
    setMineTab(null);
  };

  const filtered = useMemo(() => {
    let result = list.filter((s) => {
      if (mineTab === "mine" && !s.mine) return false;
      if (mineTab === "bookmarked" && !s.bookmarked) return false;
      if (mineTab === "drafts") return false;
      if (query) {
        const q = query.toLowerCase();
        const hit =
          s.title.toLowerCase().includes(q) ||
          s.desc.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q));
        if (!hit) return false;
      }
      if (language !== "all" && s.language !== language) return false;
      if (category !== "all" && s.category !== category) return false;
      if (activeTag && !s.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase())) return false;
      return true;
    });

    if (activeTab === "popular") {
      result = [...result].sort((a, b) => b.views - a.views);
    } else if (activeTab === "most-used") {
      result = [...result].sort((a, b) => b.uses - a.uses);
    } else if (activeTab === "latest") {
      result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const sorted = [...result].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "views":
          return b.views - a.views;
        case "uses":
          return b.uses - a.uses;
        case "title":
          return a.title.localeCompare(b.title);
        case "latest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [list, activeTab, query, language, category, activeTag, mineTab, sortBy]);

  const hasFilters = query.length > 0 || language !== "all" || category !== "all" || !!activeTag || !!mineTab;

  return {
    list,
    loading,
    stats,
    popularTags,
    trendingSnippets,
    toast,
    activeTab,
    setActiveTab,
    query,
    setQuery,
    language,
    setLanguage,
    category,
    setCategory,
    sortBy,
    setSortBy,
    activeTag,
    setActiveTag,
    mineTab,
    setMineTab,
    counts,
    toggleBookmark,
    handleOpen,
    handleUse,
    createSnippet,
    deleteSnippet,
    updateSnippet,
    clearAllFilters,
    filtered,
    hasFilters,
  };
}
