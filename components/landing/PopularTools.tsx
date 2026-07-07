"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TOOLS } from "@/lib/data/tools";
import CategoryBadge from "@/components/ui/CategoryBadge";
import { useToast } from "@/providers/toast-provider";
import { useCommandPalette } from "@/providers/command-palette-provider";

export default function PopularTools() {
  const router = useRouter();
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
        <button
          onClick={open}
          className="flex items-center gap-1 text-[13px] font-medium text-[var(--primary)]"
        >
          View all tools →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {TOOLS.map((tool) => {
          const card = (
            <div className="group flex cursor-pointer flex-col gap-2.5 rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-[var(--shadow-soft)]">
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
            <button
              key={tool.id}
              className="text-left"
              onClick={() => toast(`${tool.name} is coming soon`)}
            >
              {card}
            </button>
          );
        })}
      </div>
    </section>
  );
}
