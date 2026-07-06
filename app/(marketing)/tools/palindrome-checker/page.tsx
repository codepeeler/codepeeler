"use client";

import { TOOLS, CAT_META, type CatKey } from "@/lib/data/tools";
import ToolCard from "@/components/ui/ToolCard";
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
              {items.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onUnavailable={(t) => toast(`${t.name} is coming soon`)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
