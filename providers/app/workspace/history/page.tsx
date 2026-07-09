"use client";

import { useMemo, useState } from "react";
import { History as HistoryIcon, ChevronDown, Check, Search } from "lucide-react";
import NavRail from "@/components/workspace/NavRail";
import CollectionsStatsBar from "@/components/collections/CollectionsStatsBar";
import CollectionIcon from "@/components/collections/CollectionIcon";
import Dropdown from "@/components/ui/Dropdown";
import { WorkflowProvider } from "@/providers/workflow-provider";
import { COLLECTIONS } from "@/lib/data/collections";
import { cn, parseAgoToMinutes } from "@/lib/utils";

export default function HistoryPage() {
  const [collectionFilter, setCollectionFilter] = useState<string | "all">("all");
  const [query, setQuery] = useState("");

  const allActivity = useMemo(
    () =>
      COLLECTIONS.flatMap((c) =>
        c.activity.map((a) => ({
          ...a,
          collectionId: c.id,
          collectionName: c.name,
          icon: c.icon,
          color: c.color,
          minutes: parseAgoToMinutes(a.time),
        }))
      ).sort((a, b) => a.minutes - b.minutes),
    []
  );

  const filtered = allActivity.filter((a) => {
    if (collectionFilter !== "all" && a.collectionId !== collectionFilter) return false;
    if (query && !a.text.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const activeCollectionLabel =
    collectionFilter === "all" ? "All Collections" : COLLECTIONS.find((c) => c.id === collectionFilter)?.name ?? "All Collections";

  return (
    <WorkflowProvider>
      <div className="relative flex min-h-0 flex-1">
        <NavRail />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[900px] px-6 py-7">
            <div className="mb-6">
              <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.01em]">
                History
              </h1>
              <p className="mt-1 text-[13.5px] text-[var(--text-dim)]">
                A timeline of everything that happened across your collections
              </p>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2.5">
              <div className="flex h-9 min-w-[220px] flex-1 max-w-[360px] items-center gap-2 rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3">
                <Search size={14} className="flex-shrink-0 text-[var(--text-faint)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search activity…"
                  className="w-full bg-transparent text-[12.5px] placeholder:text-[var(--text-faint)]"
                />
              </div>

              <Dropdown
                trigger={({ toggle }) => (
                  <button
                    onClick={toggle}
                    className="flex h-9 items-center gap-1.5 rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]"
                  >
                    {activeCollectionLabel} <ChevronDown size={13} />
                  </button>
                )}
                panelClassName="max-h-[280px] overflow-y-auto w-[220px]"
              >
                {(close) => (
                  <div>
                    <button
                      onClick={() => {
                        setCollectionFilter("all");
                        close();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium transition-colors duration-150 hover:bg-[var(--card-hover)]",
                        collectionFilter === "all" ? "text-[var(--primary)]" : "text-[var(--text-dim)] hover:text-[var(--text)]"
                      )}
                    >
                      All Collections
                      {collectionFilter === "all" && <Check size={13} />}
                    </button>
                    {COLLECTIONS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setCollectionFilter(c.id);
                          close();
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-[7px] px-2.5 py-[7px] text-left text-[12px] font-medium transition-colors duration-150 hover:bg-[var(--card-hover)]",
                          collectionFilter === c.id ? "text-[var(--primary)]" : "text-[var(--text-dim)] hover:text-[var(--text)]"
                        )}
                      >
                        <span className="truncate">{c.name}</span>
                        {collectionFilter === c.id && <Check size={13} className="flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </Dropdown>

              <span className="ml-auto flex-shrink-0 text-[12px] text-[var(--text-faint)]">
                {filtered.length} events
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[var(--border)] px-6 py-16 text-center">
                <HistoryIcon size={20} className="mx-auto mb-2 text-[var(--text-faint)]" />
                <div className="mb-1 text-[14px] font-semibold">No activity found</div>
                <p className="text-[12.5px] text-[var(--text-faint)]">Try a different search term or collection.</p>
              </div>
            ) : (
              <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
                {filtered.map((a, i) => (
                  <div key={`${a.collectionId}-${a.id}`} className="relative flex gap-3 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <CollectionIcon icon={a.icon} color={a.color} size="sm" />
                      {i < filtered.length - 1 && <span className="mt-1 w-px flex-1 bg-[var(--border-soft)]" />}
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="text-[12.5px] leading-[1.5] text-[var(--text)]">{a.text}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--text-faint)]">
                        <span className="font-medium text-[var(--text-dim)]">{a.collectionName}</span>
                        <span>·</span>
                        <span>{a.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <CollectionsStatsBar />
    </WorkflowProvider>
  );
}
