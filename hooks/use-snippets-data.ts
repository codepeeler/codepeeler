"use client";

import { useMemo, useState } from "react";
import { SNIPPETS, type Snippet, type SnippetFilterKey, type SnippetLanguage } from "@/lib/data/snippets";
import { useToast } from "@/providers/toast-provider";

export type SortKey = "latest" | "rating" | "views" | "uses" | "title";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "latest", label: "Latest" },
  { key: "rating", label: "Top Rated" },
  { key: "views", label: "Most Viewed" },
  { key: "uses", label: "Most Used" },
  { key: "title", label: "Title (A–Z)" },
];

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `custom-${idCounter}`;
}

/**
 * All Snippets page state, filtering/sorting, and handlers live here.
 * DesktopSnippetsView and MobileSnippetsView each call this directly, so
 * the list of snippets a user sees, search results, and every action
 * (bookmark, create, clear filters) behave identically on both — only the
 * layout around them differs. Same pattern as useDashboardData().
 */
export function useSnippetsData() {
  const { toast } = useToast();
  const [list, setList] = useState<Snippet[]>(SNIPPETS);
  const [activeTab, setActiveTab] = useState<SnippetFilterKey>("featured");
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<SnippetLanguage | "all">("all");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("latest");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [mineTab, setMineTab] = useState<"mine" | "bookmarked" | "recent" | "drafts" | null>(null);

  const counts = useMemo(
    () => ({
      mine: list.filter((s) => s.mine).length,
      bookmarked: list.filter((s) => s.bookmarked).length,
      recent: Math.min(list.length, 15),
      drafts: 6,
    }),
    [list]
  );

  const toggleBookmark = (id: string) => {
    setList((prev) => prev.map((s) => (s.id === id ? { ...s, bookmarked: !s.bookmarked } : s)));
  };

  const handleOpen = (s: Snippet) => {
    toast(`Opening "${s.title}"…`);
  };

  const handleCreateSnippet = () => {
    const fresh: Snippet = {
      id: nextId(),
      title: "Untitled Snippet",
      desc: "Add a description for your new snippet.",
      language: "JavaScript",
      category: "Utilities",
      author: "you",
      views: 0,
      uses: 0,
      rating: 0,
      tags: [],
      bookmarked: false,
      mine: true,
      createdAgo: "just now",
      updatedAgo: "just now",
      code: "// Start typing your snippet here",
    };
    setList((prev) => [fresh, ...prev]);
    toast("New snippet created — start editing");
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
      result = [...result].reverse();
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
        default:
          return 0;
      }
    });

    return sorted;
  }, [list, activeTab, query, language, category, activeTag, mineTab, sortBy]);

  const hasFilters = query.length > 0 || language !== "all" || category !== "all" || !!activeTag || !!mineTab;

  return {
    list,
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
    handleCreateSnippet,
    clearAllFilters,
    filtered,
    hasFilters,
  };
}
