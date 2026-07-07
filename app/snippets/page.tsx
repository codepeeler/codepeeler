"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, SlidersHorizontal, Plus, Check, X } from "lucide-react";
import NavRail from "@/components/workspace/NavRail";
import Topbar from "@/components/layout/Topbar";
import Dropdown from "@/components/ui/Dropdown";
import SnippetCard from "@/components/snippets/SnippetCard";
import SnippetsStatsRow from "@/components/snippets/SnippetsStatsRow";
import SnippetsSidebar from "@/components/snippets/SnippetsSidebar";
import {
  SNIPPETS,
  LANGUAGES,
  CATEGORIES,
  FILTER_TABS,
  type Snippet,
  type SnippetFilterKey,
  type SnippetLanguage,
} from "@/lib/data/snippets";
import { useToast } from "@/providers/toast-provider";
import { WorkflowProvider } from "@/providers/workflow-provider";
import { cn } from "@/lib/utils";

type SortKey = "latest" | "rating" | "views" | "uses" | "title";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
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

export default function SnippetsPage() {
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

  return (
    <WorkflowProvider>
      <Topbar />
      <div className="relative flex min-h-0 flex-1">
        <NavRail />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-6 py-7">
            <div className="mb-1 flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
              <span>Home</span>
              <span>›</span>
              <span className="text-[var(--text-dim)]">Snippets</span>
            </div>

            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.01em]">
                  Snippets
                </h1>
                <p className="mt-1 text-[13.5px] text-[var(--text-dim)]">
                  Discover, share and reuse code snippets to build faster.
                </p>
              </div>
              <button
                onClick={handleCreateSnippet}
                className="flex items-center gap-1.5 rounded-[9px] bg-[var(--primary)] px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-90"
              >
                <Plus size={15} /> Create Snippet
              </button>
            </div>

            <SnippetsStatsRow />

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] flex-1">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search snippets..."
                  className="h-9 w-full rounded-[9px] border border-[var(--border)] bg-[var(--card)] pl-9 pr-3 text-[12.5px] outline-none transition-colors duration-150 placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
                />
              </div>

              <Dropdown
                trigger={({ open, toggle }) => (
                  <button
                    onClick={toggle}
                    className={cn(
                      "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]",
                      (open || language !== "all") && "text-[var(--text)]"
                    )}
                  >
                    {language === "all" ? "All Languages" : language} <ChevronDown size={13} />
                  </button>
                )}
              >
                {(close) => (
                  <div className="min-w-[160px]">
                    <button
                      onClick={() => {
                        setLanguage("all");
                        close();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium transition-colors duration-150 hover:bg-[var(--card-hover)]",
                        language === "all" ? "text-[var(--primary)]" : "text-[var(--text-dim)]"
                      )}
                    >
                      All Languages
                      {language === "all" && <Check size={13} />}
                    </button>
                    {LANGUAGES.map((l) => (
                      <button
                        key={l}
                        onClick={() => {
                          setLanguage(l);
                          close();
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium transition-colors duration-150 hover:bg-[var(--card-hover)]",
                          language === l ? "text-[var(--primary)]" : "text-[var(--text-dim)]"
                        )}
                      >
                        {l}
                        {language === l && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                )}
              </Dropdown>

              <Dropdown
                trigger={({ open, toggle }) => (
                  <button
                    onClick={toggle}
                    className={cn(
                      "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]",
                      (open || category !== "all") && "text-[var(--text)]"
                    )}
                  >
                    {category === "all" ? "All Categories" : category} <ChevronDown size={13} />
                  </button>
                )}
              >
                {(close) => (
                  <div className="min-w-[180px]">
                    <button
                      onClick={() => {
                        setCategory("all");
                        close();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium transition-colors duration-150 hover:bg-[var(--card-hover)]",
                        category === "all" ? "text-[var(--primary)]" : "text-[var(--text-dim)]"
                      )}
                    >
                      All Categories
                      {category === "all" && <Check size={13} />}
                    </button>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCategory(c);
                          close();
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium transition-colors duration-150 hover:bg-[var(--card-hover)]",
                          category === c ? "text-[var(--primary)]" : "text-[var(--text-dim)]"
                        )}
                      >
                        {c}
                        {category === c && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                )}
              </Dropdown>

              <Dropdown
                trigger={({ open, toggle }) => (
                  <button
                    onClick={toggle}
                    className={cn(
                      "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]",
                      open && "text-[var(--text)]"
                    )}
                  >
                    Sort by: {SORT_OPTIONS.find((o) => o.key === sortBy)?.label}
                    <ChevronDown size={13} />
                  </button>
                )}
              >
                {(close) => (
                  <div className="min-w-[168px]">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setSortBy(opt.key);
                          close();
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium transition-colors duration-150 hover:bg-[var(--card-hover)]",
                          sortBy === opt.key ? "text-[var(--primary)]" : "text-[var(--text-dim)]"
                        )}
                      >
                        {opt.label}
                        {sortBy === opt.key && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                )}
              </Dropdown>

              <button
                onClick={() => toast("Advanced filters coming soon")}
                className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]"
              >
                <SlidersHorizontal size={13} /> Filters
              </button>

              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[9px] px-2.5 text-[12px] font-medium text-[var(--text-faint)] transition-colors duration-150 hover:text-[var(--text)]"
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>

            <div className="mb-5 flex items-center gap-1 rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-1">
              {FILTER_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={cn(
                    "rounded-[7px] px-3.5 py-[7px] text-[12.5px] font-semibold transition-colors duration-150",
                    activeTab === t.key
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--text-dim)] hover:text-[var(--text)]"
                  )}
                >
                  {t.label}
                </button>
              ))}
              <span className="ml-auto mr-2 flex-shrink-0 text-[11.5px] text-[var(--text-faint)]">
                {filtered.length} snippets found
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[var(--border)] px-6 py-16 text-center">
                <div className="mb-1 text-[14px] font-semibold">No snippets match your search</div>
                <p className="text-[12.5px] text-[var(--text-faint)]">
                  Try a different search term or clear your filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filtered.map((s) => (
                  <SnippetCard
                    key={s.id}
                    snippet={s}
                    onOpen={() => handleOpen(s)}
                    onToggleBookmark={() => toggleBookmark(s.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        <div className="py-7 pr-6">
          <SnippetsSidebar
            counts={counts}
            activeMineTab={mineTab}
            onSelectMineTab={(key) => setMineTab((prev) => (prev === key ? null : key))}
            onSelectTag={(tag) => setActiveTag((prev) => (prev === tag ? null : tag))}
            onSelectTrending={(id) => {
              const target = list.find((s) => s.id === id);
              if (target) handleOpen(target);
            }}
            onCreateSnippet={handleCreateSnippet}
          />
        </div>
      </div>
    </WorkflowProvider>
  );
}
