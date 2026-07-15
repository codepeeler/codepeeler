"use client";

import { useState } from "react";
import { Search, ChevronDown, Check, X, Plus, Menu } from "lucide-react";
import MobileHeader from "@/components/layout/mobile/MobileHeader";
import MobileFooter from "@/components/layout/mobile/MobileFooter";
import Sidebar, { SIDEBAR_PANEL_ID } from "@/components/layout/Sidebar";
import Dropdown from "@/components/ui/Dropdown";
import SnippetCard from "@/components/snippets/SnippetCard";
import SnippetEditorModal from "@/components/snippets/SnippetEditorModal";
import { LANGUAGES, CATEGORIES, FILTER_TABS, type Snippet } from "@/lib/data/snippets";
import { useSnippetsData, SORT_OPTIONS } from "@/hooks/use-snippets-data";
import { useMobileShell } from "@/providers/mobile-shell-provider";
import { cn } from "@/lib/utils";

/**
 * Purpose-built mobile layout: search + filter tabs live in a single
 * horizontally-scrolling row instead of the desktop's fixed-width toolbar
 * and right-hand sidebar (which is what didn't fit on a phone screen).
 * Same useSnippetsData() as desktop, so search results, sort order, and
 * bookmarks are always identical — only the arrangement differs.
 */
export default function MobileSnippetsView() {
  const { togglePanel } = useMobileShell();
  const {
    loading,
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
    toggleBookmark,
    handleOpen,
    handleUse,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    clearAllFilters,
    filtered,
    hasFilters,
  } = useSnippetsData();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);

  const openCreate = () => {
    setEditingSnippet(null);
    setEditorOpen(true);
  };
  const openEdit = (s: Snippet) => {
    setEditingSnippet(s);
    setEditorOpen(true);
  };

  return (
    <>
      <MobileHeader
        title="Snippets"
        actions={[
          { key: "create", icon: Plus, label: "Create snippet", onClick: openCreate },
          { key: "menu", icon: Menu, label: "Menu", onClick: () => togglePanel(SIDEBAR_PANEL_ID) },
        ]}
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <Sidebar />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-4 py-4">
            <p className="mb-4 text-[12.5px] text-[var(--text-dim)]">
              Discover, share and reuse code snippets to build faster.
            </p>

            <div className="relative mb-3">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search snippets..."
                className="h-10 w-full rounded-[9px] border border-[var(--border)] bg-[var(--card)] pl-9 pr-3 text-[13px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
              />
            </div>

            <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
              {FILTER_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={cn(
                    "flex-shrink-0 rounded-[8px] px-3.5 py-2 text-[12.5px] font-semibold",
                    activeTab === t.key
                      ? "bg-[var(--primary)] text-white"
                      : "border border-[var(--border)] bg-[var(--card)] text-[var(--text-dim)]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
              <Dropdown
                trigger={({ open, toggle }) => (
                  <button
                    onClick={toggle}
                    className={cn(
                      "flex h-9 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-medium text-[var(--text-dim)]",
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
                        "flex w-full items-center justify-between rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium",
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
                          "flex w-full items-center justify-between rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium",
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
                      "flex h-9 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-medium text-[var(--text-dim)]",
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
                        "flex w-full items-center justify-between rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium",
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
                          "flex w-full items-center justify-between rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium",
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
                      "flex h-9 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-medium text-[var(--text-dim)]",
                      open && "text-[var(--text)]"
                    )}
                  >
                    {SORT_OPTIONS.find((o) => o.key === sortBy)?.label}
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
                          "flex w-full items-center justify-between rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium",
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

              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex h-9 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] px-2.5 text-[12px] font-medium text-[var(--text-faint)]"
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>

            <div className="mb-3 text-[11.5px] text-[var(--text-faint)]">{filtered.length} snippets found</div>

            {loading ? (
              <div className="rounded-[12px] border border-dashed border-[var(--border)] px-6 py-14 text-center">
                <div className="text-[13px] text-[var(--text-faint)]">Loading snippets…</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[var(--border)] px-6 py-14 text-center">
                <div className="mb-1 text-[14px] font-semibold">No snippets match your search</div>
                <p className="text-[12.5px] text-[var(--text-faint)]">
                  Try a different search term or clear your filters.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((s) => (
                  <SnippetCard
                    key={s.id}
                    snippet={s}
                    onOpen={() => handleOpen(s)}
                    onToggleBookmark={() => toggleBookmark(s.id)}
                    onUse={() => handleUse(s)}
                    onEdit={s.mine ? () => openEdit(s) : undefined}
                    onDelete={s.mine ? () => deleteSnippet(s.id) : undefined}
                  />
                ))}
              </div>
            )}

            <MobileFooter variant="full" />
          </div>
        </main>
      </div>

      {editorOpen && (
        <SnippetEditorModal
          editing={editingSnippet}
          onClose={() => setEditorOpen(false)}
          onSubmit={(values) => (editingSnippet ? updateSnippet(editingSnippet.id, values) : createSnippet(values))}
        />
      )}
    </>
  );
}
