import Link from "next/link";
import CategoryBadge from "@/components/ui/CategoryBadge";
import type { Tool } from "@/lib/data/tools";

type ToolCardProps = {
  tool: Tool;
  onUnavailable?: (tool: Tool) => void;
};

/**
 * The single tool-card component used everywhere a tool is listed —
 * the homepage's "Popular tools" grid, the /tools index page, search
 * results, etc. If the card's look needs to change, it changes here once.
 */
export default function ToolCard({ tool, onUnavailable }: ToolCardProps) {
  const card = (
    <div className="group flex h-full cursor-pointer flex-col gap-2.5 rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-[var(--shadow-soft)]">
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
