"use client";

import { useMemo, useState } from "react";
import { Plus, Search, LayoutGrid, List, ChevronDown, SlidersHorizontal, X, Check, Menu } from "lucide-react";
import Sidebar, { SIDEBAR_PANEL_ID } from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/mobile/MobileHeader";
import MobileFooter from "@/components/layout/mobile/MobileFooter";
import CollectionCard from "@/components/collections/CollectionCard";
import CollectionDetailsPanel from "@/components/collections/CollectionDetailsPanel";
import CollectionsStatsBar from "@/components/collections/CollectionsStatsBar";
import Dropdown from "@/components/ui/Dropdown";
import { COLLECTION_TEMPLATES, DEFAULT_COLLECTION_ICON_KEY, type Collection } from "@/lib/data/collections";
import { useCollections } from "@/hooks/use-collections";
import { useToast } from "@/providers/toast-provider";
import { useMobileShell } from "@/providers/mobile-shell-provider";
import { WorkflowProvider } from "@/providers/workflow-provider";
import { cn, parseAgoToMinutes } from "@/lib/utils";

type SortKey = "updated" | "created" | "name-asc" | "name-desc" | "workflows" | "tools";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "updated", label: "Recently Updated" },
  { key: "created", label: "Recently Created" },
  { key: "name-asc", label: "Name (A–Z)" },
  { key: "name-desc", label: "Name (Z–A)" },
  { key: "workflows", label: "Most Workflows" },
  { key: "tools", label: "Most Tools" },
];

const VISIBILITY_OPTIONS: Collection["visibility"][] = ["Private", "Shared", "Public"];

type OwnerFilter = "all" | Collection["owner"];

export default function CollectionsPage() {
  const { toast } = useToast();
  const { togglePanel } = useMobileShell();
  const { collections: collectionsList, createCollection, patchCollection, deleteCollection, duplicateCollection } =
    useCollections();
  const [activeTab, setActiveTab] = useState<OwnerFilter>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("updated");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [autoUpdateFilter, setAutoUpdateFilter] = useState<"all" | "on" | "off">("all");
  const [visibilityFilter, setVisibilityFilter] = useState<Collection["visibility"][]>([]);

  const allTags = useMemo(
    () => Array.from(new Set(collectionsList.flatMap((c) => c.tags))).sort(),
    [collectionsList]
  );

  const filterTabs = useMemo(
    () => [
      { key: "all" as const, label: "All Collections", count: collectionsList.length },
      { key: "me" as const, label: "My Collections", count: collectionsList.filter((c) => c.owner === "me").length },
      { key: "shared" as const, label: "Shared with me", count: collectionsList.filter((c) => c.owner === "shared").length },
      { key: "public" as const, label: "Public", count: collectionsList.filter((c) => c.owner === "public").length },
    ],
    [collectionsList]
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toggleVisibility = (v: Collection["visibility"]) => {
    setVisibilityFilter((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const clearAllFilters = () => {
    setQuery("");
    setSelectedTags([]);
    setAutoUpdateFilter("all");
    setVisibilityFilter([]);
  };

  const filtered = useMemo(() => {
    const result = collectionsList.filter((c) => {
      if (activeTab !== "all" && c.owner !== activeTab) return false;
      if (query && !c.name.toLowerCase().includes(query.toLowerCase()) && !c.desc.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (selectedTags.length > 0 && !c.tags.some((t) => selectedTags.includes(t))) return false;
      if (autoUpdateFilter !== "all" && !!c.autoUpdate !== (autoUpdateFilter === "on")) return false;
      if (visibilityFilter.length > 0 && !visibilityFilter.includes(c.visibility)) return false;
      return true;
    });

    const sorted = [...result].sort((a, b) => {
      switch (sortBy) {
        case "updated":
          return parseAgoToMinutes(a.updatedAgo) - parseAgoToMinutes(b.updatedAgo);
        case "created":
          return parseAgoToMinutes(a.createdAgo) - parseAgoToMinutes(b.createdAgo);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "workflows":
          return b.workflows - a.workflows;
        case "tools":
          return b.tools - a.tools;
        default:
          return 0;
      }
    });

    return sorted;
  }, [activeTab, query, collectionsList, selectedTags, autoUpdateFilter, visibilityFilter, sortBy]);

  const selected = selectedId ? collectionsList.find((c) => c.id === selectedId) ?? null : null;
  const hasFilters =
    query.length > 0 || selectedTags.length > 0 || autoUpdateFilter !== "all" || visibilityFilter.length > 0;
  const activeFilterCount = selectedTags.length + (autoUpdateFilter !== "all" ? 1 : 0) + visibilityFilter.length;

  const handleToggleStar = (id: string) => {
    const current = collectionsList.find((c) => c.id === id);
    if (current) patchCollection(id, { starred: !current.starred });
  };

  const handleToggleAutoUpdate = (id: string) => {
    const current = collectionsList.find((c) => c.id === id);
    if (!current) return;
    patchCollection(id, { autoUpdate: !current.autoUpdate });
    toast(`Auto update turned ${!current.autoUpdate ? "on" : "off"}`);
  };

  const handleToggleAllowDuplicate = (id: string) => {
    const current = collectionsList.find((c) => c.id === id);
    if (!current) return;
    patchCollection(id, { allowDuplicate: !current.allowDuplicate });
    toast(`Duplicate access ${!current.allowDuplicate ? "allowed" : "disallowed"}`);
  };

  const handleRename = (id: string) => {
    const current = collectionsList.find((c) => c.id === id);
    if (!current) return;
    const name = window.prompt("Rename collection", current.name);
    if (name && name.trim() && name.trim() !== current.name) {
      patchCollection(id, { name: name.trim() });
      toast(`Renamed to "${name.trim()}"`);
    }
  };

  const handleDuplicate = async (id: string) => {
    const original = collectionsList.find((c) => c.id === id);
    if (!original) return;
    const result = await duplicateCollection(id);
    if (result.ok) {
      toast(`"${original.name}" duplicated (workflows aren't copied yet — only the collection itself)`);
    } else {
      toast(result.error ?? "Couldn't duplicate collection");
    }
  };

  const handleDelete = async (id: string) => {
    const target = collectionsList.find((c) => c.id === id);
    if (selectedId === id) setSelectedId(null);
    await deleteCollection(id);
    toast(`"${target?.name ?? "Collection"}" deleted`);
  };

  const handleShare = (id: string) => {
    const target = collectionsList.find((c) => c.id === id);
    toast(`Share link copied for "${target?.name ?? "collection"}"`);
  };

  const handleExport = (id: string) => {
    const target = collectionsList.find((c) => c.id === id);
    toast(`Exporting "${target?.name ?? "collection"}"…`);
  };

  const addCollection = async (overrides?: { name?: string; desc?: string; icon?: string; color?: string }) => {
    const result = await createCollection({
      name: overrides?.name ?? "Untitled Collection",
      desc: overrides?.desc ?? "A new collection — add workflows and tools to get started.",
      icon: overrides?.icon ?? DEFAULT_COLLECTION_ICON_KEY,
      color: overrides?.color ?? "var(--primary)",
    });
    if (result.ok) {
      setSelectedId(result.collection.id);
      toast("New collection created");
    } else if (result.upgradeUrl) {
      toast(result.error ?? "Free plan limit reached");
    } else {
      toast(result.error ?? "Couldn't create collection");
    }
  };

  return (
    <WorkflowProvider>
      <MobileHeader
        title="Collections"
        actions={[
          {
            key: "menu",
            icon: Menu,
            label: "Menu",
            onClick: () => togglePanel(SIDEBAR_PANEL_ID),
          },
        ]}
      />
      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <Sidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1400px] px-4 py-5 lg:px-6 lg:py-7">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-[20px] font-bold tracking-[-0.01em] lg:text-[26px]">
                  Collections
                </h1>
                <p className="mt-1 text-[12.5px] text-[var(--text-dim)] lg:text-[13.5px]">
                  Organize and manage your workflows with powerful collections
                </p>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2 lg:justify-between lg:gap-3">
              <div className="flex flex-shrink-0 items-center gap-1 overflow-x-auto rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-1">
                {filterTabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={cn(
                      "flex items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2.5 py-[7px] text-[12px] font-semibold transition-colors duration-150 lg:px-3 lg:text-[12.5px]",
                      activeTab === t.key
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--text-dim)] hover:text-[var(--text)]"
                    )}
                  >
                    {t.label}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-px text-[10.5px]",
                        activeTab === t.key ? "bg-white/20" : "bg-[var(--border-soft)] text-[var(--text-faint)]"
                      )}
                    >
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                <div className="flex items-center overflow-hidden rounded-[9px] border border-[var(--border)] bg-[var(--card)]">
                  <button
                    onClick={() => setView("grid")}
                    title="Grid view"
                    className={cn(
                      "flex h-8 w-8 items-center justify-center transition-colors duration-150",
                      view === "grid" ? "bg-[var(--card-hover)] text-[var(--text)]" : "text-[var(--text-faint)]"
                    )}
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    title="List view"
                    className={cn(
                      "flex h-8 w-8 items-center justify-center transition-colors duration-150",
                      view === "list" ? "bg-[var(--card-hover)] text-[var(--text)]" : "text-[var(--text-faint)]"
                    )}
                  >
                    <List size={15} />
                  </button>
                </div>

                <Dropdown
                  trigger={({ open, toggle }) => (
                    <button
                      onClick={toggle}
                      className={cn(
                        "flex h-8 items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]",
                        open && "text-[var(--text)]"
                      )}
                    >
                      <span className="hidden lg:inline">Sort: </span>
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
                            "flex w-full items-center justify-between rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium transition-colors duration-150 hover:bg-[var(--card-hover)]",
                            sortBy === opt.key ? "text-[var(--primary)]" : "text-[var(--text-dim)] hover:text-[var(--text)]"
                          )}
                        >
                          {opt.label}
                          {sortBy === opt.key && <Check size={13} />}
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
                        "flex h-8 items-center gap-1.5 rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]",
                        open && "text-[var(--text)]"
                      )}
                    >
                      <SlidersHorizontal size={13} /> <span className="hidden lg:inline">Filter</span>
                      {activeFilterCount > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[9.5px] font-bold text-white">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                  )}
                  align="right"
                  panelClassName="w-[220px]"
                >
                  {() => (
                    <div>
                      <div className="px-2 pb-1 pt-1 text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--text-faint)]">
                        Visibility
                      </div>
                      {VISIBILITY_OPTIONS.map((v) => (
                        <button
                          key={v}
                          onClick={() => toggleVisibility(v)}
                          className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
                        >
                          <span
                            className={cn(
                              "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[5px] border",
                              visibilityFilter.includes(v)
                                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                : "border-[var(--border)]"
                            )}
                          >
                            {visibilityFilter.includes(v) && <Check size={11} />}
                          </span>
                          {v}
                        </button>
                      ))}

                      <div className="mt-1 border-t border-[var(--border-soft)] px-2 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--text-faint)]">
                        Auto-Update
                      </div>
                      {(["all", "on", "off"] as const).map((val) => (
                        <button
                          key={val}
                          onClick={() => setAutoUpdateFilter(val)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium transition-colors duration-150 hover:bg-[var(--card-hover)]",
                            autoUpdateFilter === val ? "text-[var(--primary)]" : "text-[var(--text-dim)] hover:text-[var(--text)]"
                          )}
                        >
                          {val === "all" ? "All Collections" : val === "on" ? "Auto-Update: On" : "Auto-Update: Off"}
                          {autoUpdateFilter === val && <Check size={13} />}
                        </button>
                      ))}

                      {(visibilityFilter.length > 0 || autoUpdateFilter !== "all") && (
                        <button
                          onClick={() => {
                            setVisibilityFilter([]);
                            setAutoUpdateFilter("all");
                          }}
                          className="mt-1 flex w-full items-center gap-1.5 rounded-[7px] border-t border-[var(--border-soft)] px-2.5 py-[7px] pt-2 text-left text-[11.5px] font-medium text-[var(--text-faint)] transition-colors duration-150 hover:text-[var(--text)]"
                        >
                          <X size={12} /> Clear these filters
                        </button>
                      )}
                    </div>
                  )}
                </Dropdown>

                <button
                  onClick={() => addCollection()}
                  className="flex h-8 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] bg-[var(--primary)] px-3 text-[12px] font-semibold text-white transition-[filter] duration-150 hover:brightness-[1.08] lg:px-3.5"
                >
                  <Plus size={14} /> <span className="hidden sm:inline">New Collection</span>
                </button>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2.5">
              <div className="flex h-9 w-full min-w-0 flex-1 items-center gap-2 rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 sm:min-w-[220px] sm:max-w-[360px] sm:flex-none">
                <Search size={14} className="flex-shrink-0 text-[var(--text-faint)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search collections…"
                  className="w-full min-w-0 bg-transparent text-[12.5px] placeholder:text-[var(--text-faint)]"
                />
              </div>

              <Dropdown
                trigger={({ open, toggle }) => (
                  <button
                    onClick={toggle}
                    className={cn(
                      "flex h-9 items-center gap-1.5 rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]",
                      (open || selectedTags.length > 0) && "text-[var(--text)]"
                    )}
                  >
                    {selectedTags.length > 0 ? `${selectedTags.length} Tag${selectedTags.length > 1 ? "s" : ""}` : "All Tags"}{" "}
                    <ChevronDown size={13} />
                  </button>
                )}
                panelClassName="max-h-[260px] overflow-y-auto w-[200px]"
              >
                {() => (
                  <div>
                    {allTags.length === 0 ? (
                      <div className="px-2.5 py-2 text-[12px] text-[var(--text-faint)]">No tags yet</div>
                    ) : (
                      allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
                        >
                          <span
                            className={cn(
                              "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[5px] border",
                              selectedTags.includes(tag)
                                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                : "border-[var(--border)]"
                            )}
                          >
                            {selectedTags.includes(tag) && <Check size={11} />}
                          </span>
                          {tag}
                        </button>
                      ))
                    )}
                    {selectedTags.length > 0 && (
                      <button
                        onClick={() => setSelectedTags([])}
                        className="mt-1 flex w-full items-center gap-1.5 rounded-[7px] border-t border-[var(--border-soft)] px-2.5 py-[7px] pt-2 text-left text-[11.5px] font-medium text-[var(--text-faint)] transition-colors duration-150 hover:text-[var(--text)]"
                      >
                        <X size={12} /> Clear tags
                      </button>
                    )}
                  </div>
                )}
              </Dropdown>

              <Dropdown
                trigger={({ open, toggle }) => (
                  <button
                    onClick={toggle}
                    className={cn(
                      "flex h-9 items-center gap-1.5 rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]",
                      (open || autoUpdateFilter !== "all") && "text-[var(--text)]"
                    )}
                  >
                    {autoUpdateFilter === "all" ? "All Statuses" : autoUpdateFilter === "on" ? "Auto-Update: On" : "Auto-Update: Off"}{" "}
                    <ChevronDown size={13} />
                  </button>
                )}
              >
                {(close) => (
                  <div className="min-w-[160px]">
                    {(["all", "on", "off"] as const).map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          setAutoUpdateFilter(val);
                          close();
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium transition-colors duration-150 hover:bg-[var(--card-hover)]",
                          autoUpdateFilter === val ? "text-[var(--primary)]" : "text-[var(--text-dim)] hover:text-[var(--text)]"
                        )}
                      >
                        {val === "all" ? "All Statuses" : val === "on" ? "Auto-Update: On" : "Auto-Update: Off"}
                        {autoUpdateFilter === val && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                )}
              </Dropdown>

              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex h-9 items-center gap-1.5 rounded-[9px] px-2.5 text-[12px] font-medium text-[var(--text-faint)] transition-colors duration-150 hover:text-[var(--text)]"
                >
                  <X size={13} /> Clear Filters
                </button>
              )}

              <span className="ml-auto flex-shrink-0 text-[12px] text-[var(--text-faint)]">
                {filtered.length} collections found
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[var(--border)] px-6 py-16 text-center">
                <div className="mb-1 text-[14px] font-semibold">No collections match your search</div>
                <p className="text-[12.5px] text-[var(--text-faint)]">
                  Try a different search term or clear your filters.
                </p>
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((c) => (
                  <CollectionCard
                    key={c.id}
                    collection={c}
                    selected={selectedId === c.id}
                    onSelect={() => setSelectedId(c.id)}
                    onToggleStar={() => handleToggleStar(c.id)}
                    onRename={() => handleRename(c.id)}
                    onDuplicate={() => handleDuplicate(c.id)}
                    onShare={() => handleShare(c.id)}
                    onExport={() => handleExport(c.id)}
                    onDelete={() => handleDelete(c.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filtered.map((c) => (
                  <CollectionCard
                    key={c.id}
                    collection={c}
                    selected={selectedId === c.id}
                    view="list"
                    onSelect={() => setSelectedId(c.id)}
                    onToggleStar={() => handleToggleStar(c.id)}
                    onRename={() => handleRename(c.id)}
                    onDuplicate={() => handleDuplicate(c.id)}
                    onShare={() => handleShare(c.id)}
                    onExport={() => handleExport(c.id)}
                    onDelete={() => handleDelete(c.id)}
                  />
                ))}
              </div>
            )}

            <div id="templates" className="mt-10 scroll-mt-6 border-t border-[var(--border-soft)] pt-7">
              <div className="mb-3.5 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">
                  Collection Templates
                </h2>
                <button
                  onClick={() => toast("More templates coming soon")}
                  className="text-[12px] font-semibold text-[var(--primary)] hover:underline"
                >
                  View All Templates →
                </button>
              </div>
              <p className="mb-4 -mt-2 text-[12.5px] text-[var(--text-faint)]">
                Quick start with pre-built collection templates
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {COLLECTION_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      addCollection({
                        name: t.label,
                        desc: `Quick start collection based on the "${t.label}" template.`,
                        icon: t.id,
                        color: t.color,
                      });
                    }}
                    className="flex flex-col items-start gap-2.5 rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-3.5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-[var(--shadow-soft)]"
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-[9px] border"
                      style={{
                        color: t.color,
                        background: `color-mix(in srgb, ${t.color} 14%, transparent)`,
                        borderColor: `color-mix(in srgb, ${t.color} 30%, transparent)`,
                      }}
                    >
                      <t.icon size={17} />
                    </span>
                    <div>
                      <div className="text-[12.5px] font-semibold">{t.label}</div>
                      <div className="text-[10.5px] text-[var(--text-faint)]">{t.meta}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <MobileFooter variant="full" />
          </div>
          </main>
        </div>

        {selected && (
          <CollectionDetailsPanel
            collection={selected}
            onClose={() => setSelectedId(null)}
            onToggleAutoUpdate={() => handleToggleAutoUpdate(selected.id)}
            onToggleAllowDuplicate={() => handleToggleAllowDuplicate(selected.id)}
            onRename={() => handleRename(selected.id)}
            onDuplicate={() => handleDuplicate(selected.id)}
            onShare={() => handleShare(selected.id)}
            onExport={() => handleExport(selected.id)}
            onDelete={() => handleDelete(selected.id)}
          />
        )}
      </div>

      <CollectionsStatsBar />
    </WorkflowProvider>
  );
}
