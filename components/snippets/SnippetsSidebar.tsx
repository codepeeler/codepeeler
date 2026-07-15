"use client";

import { Sparkles, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { MY_SNIPPETS_NAV, type SnippetFilterKey } from "@/lib/data/snippets";

const TAG_COLORS = ["var(--cat-gen)", "var(--cat-data)", "var(--cat-encode)", "var(--cat-web)", "var(--cat-image)"];

export default function SnippetsSidebar({
  counts,
  activeMineTab,
  onSelectMineTab,
  onSelectTag,
  onSelectTrending,
  onCreateSnippet,
  popularTags,
  trendingSnippets,
}: {
  counts: Record<"mine" | "bookmarked" | "recent" | "drafts", number>;
  activeMineTab: string | null;
  onSelectMineTab: (key: "mine" | "bookmarked" | "recent" | "drafts") => void;
  onSelectTag: (tag: string) => void;
  onSelectTrending: (id: string) => void;
  onCreateSnippet: () => void;
  popularTags: { label: string; count: string }[];
  trendingSnippets: { id: string; title: string; author: string; uses: string }[];
}) {
  return (
    <aside className="hidden w-[280px] flex-shrink-0 flex-col gap-4 xl:flex">
      <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
        <h3 className="mb-2.5 text-[13px] font-semibold">My Snippets</h3>
        <div className="flex flex-col gap-0.5">
          {MY_SNIPPETS_NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => onSelectMineTab(item.key)}
              className={cn(
                "flex items-center justify-between rounded-[8px] px-2 py-[7px] text-[12.5px] font-medium transition-colors duration-150",
                activeMineTab === item.key
                  ? "bg-[var(--primary-dim)] text-[var(--primary)]"
                  : "text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
              )}
            >
              <span className="flex items-center gap-2">
                <item.icon size={14} />
                {item.label}
              </span>
              <span className="text-[11px] text-[var(--text-faint)]">{counts[item.key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Popular Tags</h3>
        </div>
        {popularTags.length === 0 ? (
          <p className="text-[11.5px] text-[var(--text-faint)]">No tags yet — add tags when you create a snippet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {popularTags.map((t, i) => (
              <button
                key={t.label}
                onClick={() => onSelectTag(t.label)}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--bg)] px-2.5 py-1 text-[11px] font-medium transition-colors duration-150 hover:border-[var(--border)]"
              >
                <span style={{ color: TAG_COLORS[i % TAG_COLORS.length] }}>{t.label}</span>
                <span className="text-[var(--text-faint)]">{t.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[13px] font-semibold">
            <Flame size={14} className="text-[var(--warning)]" />
            Trending Snippets
          </h3>
        </div>
        {trendingSnippets.length === 0 ? (
          <p className="text-[11.5px] text-[var(--text-faint)]">No snippets used yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {trendingSnippets.map((t, i) => (
              <button
                key={t.id}
                onClick={() => onSelectTrending(t.id)}
                className="flex w-full items-center gap-2.5 rounded-[8px] px-1.5 py-1 text-left transition-colors duration-150 hover:bg-[var(--card-hover)]"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[6px] bg-[var(--primary-dim)] text-[11px] font-bold text-[var(--primary)]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium">{t.title}</div>
                  <div className="truncate text-[10.5px] text-[var(--text-faint)]">@{t.author}</div>
                </div>
                <span className="flex-shrink-0 text-[10.5px] text-[var(--text-faint)]">▷ {t.uses}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[12px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))] p-4">
        <h3 className="mb-1 flex items-center gap-1.5 text-[13px] font-semibold">
          <Sparkles size={14} className="text-[var(--primary)]" />
          Contribute to Community
        </h3>
        <p className="mb-3 text-[11.5px] leading-[1.5] text-[var(--text-dim)]">
          Share your useful snippets and help developers around the world.
        </p>
        <button
          onClick={onCreateSnippet}
          className="w-full rounded-[9px] bg-[var(--primary)] px-3 py-2 text-[12.5px] font-semibold text-white transition-opacity duration-150 hover:opacity-90"
        >
          + Create Snippet
        </button>
      </div>
    </aside>
  );
}
