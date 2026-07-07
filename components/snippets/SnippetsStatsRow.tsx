import { SNIPPET_STATS, SNIPPET_STAT_ICONS } from "@/lib/data/snippets";

const LABELS: Record<string, { title: string; sub: string }> = {
  totalSnippets: { title: "Total Snippets", sub: SNIPPET_STATS.totalSnippetsGrowth },
  totalUses: { title: "Total Uses", sub: SNIPPET_STATS.totalUsesGrowth },
  contributors: { title: "Contributors", sub: SNIPPET_STATS.contributorsGrowth },
  avgRating: { title: "Average Rating", sub: SNIPPET_STATS.avgRatingSub },
};

export default function SnippetsStatsRow() {
  return (
    <div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {SNIPPET_STAT_ICONS.map(({ key, icon: Icon, color }) => {
        const meta = LABELS[key];
        const value = SNIPPET_STATS[key as keyof typeof SNIPPET_STATS];
        const isGrowth = meta.sub.startsWith("+");
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
              <div className={isGrowth ? "text-[10.5px] text-[var(--success)]" : "text-[10.5px] text-[var(--text-faint)]"}>
                {meta.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
