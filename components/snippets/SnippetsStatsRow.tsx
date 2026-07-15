import { SNIPPET_STAT_ICONS } from "@/lib/data/snippets";
import type { SnippetStats } from "@/hooks/use-snippets-data";

const LABELS: Record<string, { title: string; subKey: keyof SnippetStats }> = {
  totalSnippets: { title: "Total Snippets", subKey: "totalSnippets" },
  totalUses: { title: "Total Uses", subKey: "totalUses" },
  contributors: { title: "Contributors", subKey: "contributors" },
  avgRating: { title: "Average Rating", subKey: "avgRating" },
};

export default function SnippetsStatsRow({ stats, loading }: { stats: SnippetStats; loading?: boolean }) {
  const subFor = (key: string) => {
    if (key === "totalSnippets") return `${stats.totalSnippets} total`;
    if (key === "totalUses") return `${stats.totalUses} uses`;
    if (key === "contributors") return `${stats.contributors} contributing`;
    return stats.avgRatingSub;
  };

  return (
    <div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {SNIPPET_STAT_ICONS.map(({ key, icon: Icon, color }) => {
        const meta = LABELS[key];
        const value = loading ? "—" : stats[key as keyof SnippetStats];
        return (
          <div
            key={key}
            className="flex items-center gap-3.5 rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <span
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] border"
              style={{
                color,
                background: `color-mix(in srgb, ${color} 14%, transparent)`,
                borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
              }}
            >
              <Icon size={19} />
            </span>
            <div className="min-w-0">
              <div className="font-[family-name:var(--font-display)] text-[19px] font-bold leading-tight">
                {value}
              </div>
              <div className="text-[12px] text-[var(--text-dim)]">{meta.title}</div>
              <div className="text-[10.5px] text-[var(--text-faint)]">{loading ? "" : subFor(key)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
