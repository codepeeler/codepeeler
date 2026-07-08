"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { TOOLS, type Tool } from "@/lib/data/tools";
import ToolCard from "@/components/ui/ToolCard";
import { useToast } from "@/providers/toast-provider";
import { getToolVisitCounts, TOOL_VISITS_STORAGE_KEY } from "@/lib/tool-usage";

// Shown on the landing page before we have any real usage data for this
// browser yet. Keep this short — the landing page should feel curated,
// not like a full catalog. Once the user opens tools, this list reorders
// itself around whatever they actually reach for most.
const DEFAULT_FEATURED_IDS = ["json", "base64", "regex", "uuid", "hash", "password"];

const FEATURED_COUNT = 6;

function rankTools(): Tool[] {
  const counts = getToolVisitCounts();
  const withPage = TOOLS.filter((t): t is Tool & { page: string } => !!t.page);

  const used = withPage
    .filter((t) => (counts[t.page] ?? 0) > 0)
    .sort((a, b) => (counts[b.page] ?? 0) - (counts[a.page] ?? 0));

  if (used.length >= FEATURED_COUNT) return used.slice(0, FEATURED_COUNT);

  // Fill remaining slots with defaults (or the first tools) that aren't
  // already included, so the section always shows a full row.
  const usedIds = new Set(used.map((t) => t.id));
  const fallback = [
    ...DEFAULT_FEATURED_IDS.map((id) => withPage.find((t) => t.id === id)).filter(
      (t): t is Tool & { page: string } => !!t && !usedIds.has(t.id)
    ),
    ...withPage.filter((t) => !usedIds.has(t.id)),
  ];

  const seen = new Set(usedIds);
  const filled: Tool[] = [...used];
  for (const t of fallback) {
    if (filled.length >= FEATURED_COUNT) break;
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    filled.push(t);
  }
  return filled;
}

const DEFAULT_TOOLS: Tool[] = TOOLS.filter((t) => DEFAULT_FEATURED_IDS.includes(t.id)).sort(
  (a, b) => DEFAULT_FEATURED_IDS.indexOf(a.id) - DEFAULT_FEATURED_IDS.indexOf(b.id)
);

// useSyncExternalStore requires getSnapshot to return the SAME reference
// when nothing has changed — otherwise React thinks the store is updating
// on every render and throws "Maximum update depth exceeded". rankTools()
// builds a brand-new array each call, so we cache its result and only
// recompute when the underlying localStorage value has actually changed.
let cachedRaw: string | null = null;
let cachedResult: Tool[] = DEFAULT_TOOLS;

function getSnapshot(): Tool[] {
  const raw = typeof window !== "undefined" ? window.localStorage.getItem(TOOL_VISITS_STORAGE_KEY) : null;
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedResult = rankTools();
  }
  return cachedResult;
}

// Usage counts never change from outside this tab, so there's nothing to
// subscribe to — we only need useSyncExternalStore for its snapshot split:
// a stable server/first-paint value (DEFAULT_TOOLS) and a client-only real
// value (getSnapshot()), without the setState-in-effect churn that would
// otherwise be needed to avoid a hydration mismatch.
function subscribe() {
  return () => {};
}

export default function PopularTools() {
  const { toast } = useToast();
  const tools = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_TOOLS);

  return (
    <section id="popular-tools" className="w-full px-8 pt-11">
      <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-2.5">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.01em]">
            Popular tools
          </h2>
          <p className="mt-1 text-[13.5px] text-[var(--text-dim)]">
            Runs fully in your browser — nothing to install.
          </p>
        </div>
        <Link
          href="/tools"
          className="flex items-center gap-1 text-[13px] font-medium text-[var(--primary)]"
        >
          Browse all tools →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onUnavailable={(t) => toast(`${t.name} is coming soon`)}
          />
        ))}
      </div>
    </section>
  );
}
