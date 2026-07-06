"use client";

import { TOOLS } from "@/lib/data/tools";
import ToolCard from "@/components/ui/ToolCard";
import { useToast } from "@/providers/toast-provider";
import { useCommandPalette } from "@/providers/command-palette-provider";

export default function PopularTools() {
  const { toast } = useToast();
  const { open } = useCommandPalette();

  return (
    <section id="popular-tools" className="w-full px-8 pt-11">
      <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-2.5">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.01em]">
            Popular tools
          </h2>
          <p className="mt-1 text-[13.5px] text-[var(--text-dim)]">
            Open any tool below — it runs fully in your browser, nothing to install.
          </p>
        </div>
        <button onClick={open} className="flex items-center gap-1 text-[13px] font-medium text-[var(--primary)]">
          View all tools →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {TOOLS.slice(0, 8).map((tool) => (
          <ToolCard key={tool.id} tool={tool} onUnavailable={(t) => toast(`${t.name} is coming soon`)} />
        ))}
      </div>
    </section>
  );
}
