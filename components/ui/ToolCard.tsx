import Link from "next/link";
import { Star } from "lucide-react";
import CategoryBadge from "@/components/ui/CategoryBadge";
import type { Tool } from "@/lib/data/tools";

type ToolCardProps = {
  tool: Tool;
  onUnavailable?: (tool: Tool) => void;
  // Optional pin control — omit both to render the plain card as before
  // (homepage, /tools index, search results). Pass both wherever a real
  // pin/unpin toggle is needed (dashboard Favorite Tools, Favorites page).
  isFavorite?: boolean;
  onToggleFavorite?: (tool: Tool) => void;
};

/**
 * The single tool-card component used everywhere a tool is listed —
 * the homepage's "Popular tools" grid, the /tools index page, search
 * results, etc. If the card's look needs to change, it changes here once.
 */
export default function ToolCard({ tool, onUnavailable, isFavorite, onToggleFavorite }: ToolCardProps) {
  const showPin = onToggleFavorite !== undefined;

  const card = (
    <div className="group relative flex h-full cursor-pointer flex-col gap-2.5 rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-[var(--shadow-soft)]">
      {showPin && (
        <button
          type="button"
          aria-label={isFavorite ? "Unpin tool" : "Pin tool"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite?.(tool);
          }}
          className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--card-hover)]"
        >
          <Star size={14} className={isFavorite ? "fill-[var(--warning)] text-[var(--warning)]" : ""} />
        </button>
      )}
      <CategoryBadge cat={tool.cat}>{tool.badge}</CategoryBadge>
      <div>
        <div className="text-sm font-semibold">{tool.name}</div>
        <div className="text-xs text-[var(--text-faint)]">{tool.desc}</div>
      </div>
    </div>
  );

  if (tool.page) {
    return <Link href={tool.page}>{card}</Link>;
  }

  return (
    <button className="text-left" onClick={() => onUnavailable?.(tool)}>
      {card}
    </button>
  );
}
