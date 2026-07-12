"use client";

import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import FeaturedPost from "@/components/blog/FeaturedPost";
import BlogPostCard from "@/components/blog/BlogPostCard";
import { CategoriesWidget, NewsletterWidget, FeaturedSidebarWidget } from "@/components/blog/BlogSidebarWidgets";
import { useBlogData } from "@/hooks/use-blog-data";
import { cn } from "@/lib/utils";

export default function DesktopBlogView() {
  const data = useBlogData();
  const { featuredPost, featuredSidebar, categories, activeCategory, setActiveCategory, sortTab, setSortTab, sortTabs, visiblePosts, hasMore, loadMore, email, setEmail, subscribe } = data;

  return (
    <div className="relative flex min-h-0 flex-1">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-6 py-7">
          <div className="mb-1 flex items-center gap-1.5 text-[12px] text-[var(--text-faint)]">
            <span>Home</span>
            <span>›</span>
            <span className="text-[var(--text-dim)]">Blog</span>
          </div>

          <div className="mb-6">
            <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.01em]">Blog</h1>
            <p className="mt-1 text-[13.5px] text-[var(--text-dim)]">
              Insights, tutorials, and updates from the CodePeeler team.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
            <div className="min-w-0">
              <div className="mb-6">
                <FeaturedPost post={featuredPost} />
              </div>

              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-[16px] font-semibold">Latest Articles</h2>
                <div className="flex items-center gap-1 rounded-[9px] border border-[var(--border)] bg-[var(--card)] p-1">
                  {sortTabs.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSortTab(t)}
                      className={cn(
                        "rounded-[7px] px-3 py-[6px] text-[12px] font-semibold transition-colors duration-150",
                        sortTab === t ? "bg-[var(--primary)] text-white" : "text-[var(--text-dim)] hover:text-[var(--text)]"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {visiblePosts.map((p) => (
                  <BlogPostCard key={p.id} post={p} />
                ))}
              </div>

              {hasMore && (
                <button
                  onClick={loadMore}
                  className="mx-auto mt-6 flex items-center gap-1.5 rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[12.5px] font-semibold text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]"
                >
                  Load More Articles
                </button>
              )}
            </div>

            <aside className="flex flex-col gap-5">
              <CategoriesWidget categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
              <NewsletterWidget email={email} setEmail={setEmail} subscribe={subscribe} />
              <FeaturedSidebarWidget featuredSidebar={featuredSidebar} />
            </aside>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
