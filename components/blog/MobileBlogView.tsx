"use client";

import { Menu } from "lucide-react";
import MobileHeader from "@/components/layout/mobile/MobileHeader";
import MobileFooter from "@/components/layout/mobile/MobileFooter";
import Sidebar, { SIDEBAR_PANEL_ID } from "@/components/layout/Sidebar";
import FeaturedPost from "@/components/blog/FeaturedPost";
import BlogPostCard from "@/components/blog/BlogPostCard";
import { CategoriesWidget, NewsletterWidget, FeaturedSidebarWidget } from "@/components/blog/BlogSidebarWidgets";
import { useBlogData } from "@/hooks/use-blog-data";
import { useMobileShell } from "@/providers/mobile-shell-provider";
import { cn } from "@/lib/utils";

/**
 * Purpose-built mobile layout: category filters collapse into a horizontal
 * scroll row, the right rail (categories/newsletter/featured) drops below
 * the article list instead of sitting beside it. Same useBlogData() as
 * desktop, so the posts shown and sort order are always identical.
 */
export default function MobileBlogView() {
  const { togglePanel } = useMobileShell();
  const {
    featuredPost,
    featuredSidebar,
    categories,
    activeCategory,
    setActiveCategory,
    sortTab,
    setSortTab,
    sortTabs,
    visiblePosts,
    hasMore,
    loadMore,
    email,
    setEmail,
    subscribe,
  } = useBlogData();

  return (
    <>
      <MobileHeader
        title="Blog"
        actions={[{ key: "menu", icon: Menu, label: "Menu", onClick: () => togglePanel(SIDEBAR_PANEL_ID) }]}
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <Sidebar />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-4 py-4">
            <p className="mb-4 text-[12.5px] text-[var(--text-dim)]">
              Insights, tutorials, and updates from the CodePeeler team.
            </p>

            <div className="mb-5">
              <FeaturedPost post={featuredPost} />
            </div>

            <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
              {categories.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setActiveCategory(c.name)}
                  className={cn(
                    "flex-shrink-0 rounded-[8px] px-3.5 py-2 text-[12.5px] font-semibold",
                    activeCategory === c.name
                      ? "bg-[var(--primary)] text-white"
                      : "border border-[var(--border)] bg-[var(--card)] text-[var(--text-dim)]"
                  )}
                >
                  {c.name} <span className="opacity-70">· {c.count}</span>
                </button>
              ))}
            </div>

            <div className="-mx-4 mb-4 flex items-center gap-1 overflow-x-auto px-4">
              {sortTabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setSortTab(t)}
                  className={cn(
                    "flex-shrink-0 rounded-[8px] px-3 py-[7px] text-[12px] font-semibold",
                    sortTab === t
                      ? "bg-[var(--primary)] text-white"
                      : "border border-[var(--border)] bg-[var(--card)] text-[var(--text-dim)]"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {visiblePosts.map((p) => (
                <BlogPostCard key={p.id} post={p} compact />
              ))}
            </div>

            {hasMore && (
              <button
                onClick={loadMore}
                className="mx-auto mt-5 flex items-center gap-1.5 rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[12.5px] font-semibold text-[var(--text-dim)]"
              >
                Load More Articles
              </button>
            )}

            <div className="mt-6 flex flex-col gap-4">
              <CategoriesWidget categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
              <NewsletterWidget email={email} setEmail={setEmail} subscribe={subscribe} />
              <FeaturedSidebarWidget featuredSidebar={featuredSidebar} />
            </div>

            <MobileFooter variant="full" />
          </div>
        </main>
      </div>
    </>
  );
}
