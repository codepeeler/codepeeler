"use client";

import Link from "next/link";
import { TOOLS, CAT_META, type CatKey } from "@/lib/data/tools";
import CategoryBadge from "@/components/ui/CategoryBadge";
import { useToast } from "@/providers/toast-provider";

export default function ToolsIndexPage() {
  const { toast } = useToast();
  const cats = Object.keys(CAT_META) as CatKey[];

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold tracking-[-0.01em]">
          All tools
        </h1>
        <p className="mt-1.5 text-[14px] text-[var(--text-dim)]">
          Everything runs fully in your browser — nothing you type ever leaves your device.
        </p>
      </div>

      {cats.map((cat) => {
        const items = TOOLS.filter((t) => t.cat === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat} className="mb-9">
            <h2 className="mb-3 font-[family-name:var(--font-display)] text-[16px] font-semibold">
              {CAT_META[cat].label}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((tool) => {
                const card = (
                  <div className="group flex h-full cursor-pointer flex-col gap-2.5 rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-[var(--shadow-soft)]">
                    <CategoryBadge cat={tool.cat}>{tool.badge}</CategoryBadge>
                    <div>
                      <div className="text-sm font-semibold">{tool.name}</div>
                      <div className="text-xs text-[var(--text-faint)]">{tool.desc}</div>
                    </div>
                  </div>
                );
                return tool.page ? (
                  <Link key={tool.id} href={tool.page}>
                    {card}
                  </Link>
                ) : (
                  <button key={tool.id} className="text-left" onClick={() => toast(`${tool.name} is coming soon`)}>
                    {card}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
