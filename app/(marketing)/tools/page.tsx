"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { TOOLS, CAT_META, getCategoryCount, type CatKey } from "@/lib/data/tools";
import ToolCard from "@/components/ui/ToolCard";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

const CAT_KEYS = Object.keys(CAT_META) as CatKey[];

function ToolsIndexInner() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCat = searchParams.get("cat") as CatKey | null;
  const [query, setQuery] = useState("");

  const setCat = (cat: CatKey | null) => {
    router.push(cat ? `/tools?cat=${cat}` : "/tools", { scroll: false });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      const matchesCat = !activeCat || t.cat === activeCat;
      const matchesQuery =
        !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [activeCat, query]);

  const groupedByCat = useMemo(() => {
    return CAT_KEYS.map((cat) => ({
      cat,
      items: filtered.filter((t) => t.cat === cat),
    })).filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold tracking-[-0.01em]">
          All tools
        </h1>
        <p className="mt-1.5 text-[14px] text-[var(--text-dim)]">
          Everything runs fully in your browser — nothing you type ever leaves your device.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-[420px]">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools…"
          className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--card)] py-2.5 pl-9 pr-9 text-[13.5px] placeholder:text-[var(--text-faint)] focus:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))]"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text)]"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Category filter chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setCat(null)}
          className={cn(
            "rounded-[8px] border px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-150",
            !activeCat
              ? "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--primary)]"
              : "border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)]"
          )}
        >
          All ({TOOLS.length})
        </button>
        {CAT_KEYS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCat(cat)}
            className={cn(
              "rounded-[8px] border px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-150",
              activeCat === cat
                ? "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--primary)]"
                : "border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)]"
            )}
          >
            {CAT_META[cat].label} ({getCategoryCount(cat)})
          </button>
        ))}
      </div>

      {groupedByCat.length === 0 && (
        <p className="py-12 text-center text-[13.5px] text-[var(--text-faint)]">
          No tools match &ldquo;{query}&rdquo;.
        </p>
      )}

      {groupedByCat.map(({ cat, items }) => (
        <div key={cat} className="mb-9">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-[16px] font-semibold">
            {CAT_META[cat].label}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onUnavailable={(t) => toast(`${t.name} is coming soon`)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ToolsIndexPage() {
  return (
    <Suspense fallback={null}>
      <ToolsIndexInner />
    </Suspense>
  );
}
