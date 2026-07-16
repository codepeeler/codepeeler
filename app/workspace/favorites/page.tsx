"use client";

import Link from "next/link";
import { Star, Workflow, Wrench } from "lucide-react";
import NavRail from "@/components/workspace/NavRail";
import CollectionsStatsBar from "@/components/collections/CollectionsStatsBar";
import CollectionIcon from "@/components/collections/CollectionIcon";
import ToolCard from "@/components/ui/ToolCard";
import { WorkflowProvider } from "@/providers/workflow-provider";
import { COLLECTIONS } from "@/lib/data/collections";
import { useFavoriteTools } from "@/hooks/use-favorite-tools";

export default function FavoritesPage() {
  const starredCollections = COLLECTIONS.filter((c) => c.starred);
  // Real per-account pinned tools (tool_favorite table) — replaces the old
  // hardcoded PINNED_TOOL_IDS demo list.
  const { favoriteTools, toggle: toggleFavorite } = useFavoriteTools();

  return (
    <WorkflowProvider>
      <div className="relative flex min-h-0 flex-1">
        <NavRail />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-6 py-7">
            <div className="mb-7">
              <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.01em]">
                Favorites
              </h1>
              <p className="mt-1 text-[13.5px] text-[var(--text-dim)]">
                Your starred collections and most-used tools, all in one place
              </p>
            </div>

            <div className="mb-9">
              <h2 className="mb-3 flex items-center gap-1.5 font-[family-name:var(--font-display)] text-[16px] font-semibold">
                <Star size={15} className="fill-[var(--warning)] text-[var(--warning)]" /> Starred Collections
              </h2>

              {starredCollections.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-[var(--border)] px-6 py-10 text-center">
                  <p className="text-[12.5px] text-[var(--text-faint)]">
                    You haven&apos;t starred any collections yet. Star a collection from the{" "}
                    <Link href="/collections" className="font-semibold text-[var(--primary)] hover:underline">
                      Collections page
                    </Link>{" "}
                    to see it here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {starredCollections.map((c) => (
                    <Link
                      key={c.id}
                      href="/collections"
                      className="group flex h-full flex-col gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-[var(--shadow-soft)]"
                    >
                      <div className="flex items-start justify-between">
                        <CollectionIcon icon={c.icon} color={c.color} size="md" />
                        <Star size={15} className="flex-shrink-0 fill-[var(--warning)] text-[var(--warning)]" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 text-[14.5px] font-semibold leading-tight">{c.name}</div>
                        <p className="line-clamp-2 text-[12px] leading-[1.5] text-[var(--text-faint)]">{c.desc}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-[var(--border-soft)] pt-3 text-[11.5px] text-[var(--text-faint)]">
                        <span className="flex items-center gap-1.5">
                          <Workflow size={13} />
                          {c.workflows} workflows
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Wrench size={13} />
                          {c.tools} tools
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-1 font-[family-name:var(--font-display)] text-[16px] font-semibold">
                Pinned Tools
              </h2>
              <p className="mb-3 text-[12.5px] text-[var(--text-faint)]">
                Tools you&apos;ve pinned — tap the star on any tool card to pin or unpin it
              </p>
              {favoriteTools.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-[var(--border)] px-6 py-10 text-center">
                  <p className="text-[12.5px] text-[var(--text-faint)]">
                    You haven&apos;t pinned any tools yet. Pin a tool from the{" "}
                    <Link href="/tools" className="font-semibold text-[var(--primary)] hover:underline">
                      Tools page
                    </Link>{" "}
                    or your dashboard to see it here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {favoriteTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      isFavorite
                      onToggleFavorite={(t) => toggleFavorite(t.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <CollectionsStatsBar />
    </WorkflowProvider>
  );
}
