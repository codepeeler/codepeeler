import Link from "next/link";
import { cn } from "@/lib/utils";
import type { useBlogData } from "@/hooks/use-blog-data";

type BlogData = ReturnType<typeof useBlogData>;

export function CategoriesWidget({
  categories,
  activeCategory,
  setActiveCategory,
}: Pick<BlogData, "categories" | "activeCategory" | "setActiveCategory">) {
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
      <h3 className="mb-2.5 text-[13.5px] font-semibold">Categories</h3>
      <div className="flex flex-col gap-0.5">
        {categories.map((c) => (
          <button
            key={c.name}
            onClick={() => setActiveCategory(c.name)}
            className={cn(
              "flex items-center justify-between rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium transition-colors duration-150",
              activeCategory === c.name
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
            )}
          >
            {c.name}
            <span className={cn("text-[11px]", activeCategory === c.name ? "text-white/80" : "text-[var(--text-faint)]")}>
              {c.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function NewsletterWidget({ email, setEmail, subscribe }: Pick<BlogData, "email" | "setEmail" | "subscribe">) {
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
      <h3 className="mb-1.5 text-[13.5px] font-semibold">Subscribe to our newsletter</h3>
      <p className="mb-3 text-[12px] text-[var(--text-faint)]">
        Get the latest tutorials, tips, and updates delivered to your inbox.
      </p>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="mb-2 h-9 w-full rounded-[9px] border border-[var(--border)] bg-[var(--bg-elev)] px-3 text-[12.5px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
      />
      <button
        onClick={subscribe}
        className="w-full rounded-[9px] bg-[var(--primary)] py-2 text-[12.5px] font-semibold text-white transition-opacity duration-150 hover:opacity-90"
      >
        Subscribe
      </button>
      <p className="mt-2 text-[10.5px] text-[var(--text-faint)]">No spam. Unsubscribe anytime.</p>
    </div>
  );
}

export function FeaturedSidebarWidget({ featuredSidebar: items }: Pick<BlogData, "featuredSidebar">) {
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
      <h3 className="mb-2.5 text-[13.5px] font-semibold">Featured Posts</h3>
      <div className="flex flex-col gap-3">
        {items.map(({ id, title, date, icon: Icon, color }) => (
          <Link key={id} href="/blog" className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px]"
              style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}
            >
              <Icon size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold leading-tight">{title}</div>
              <div className="text-[10.5px] text-[var(--text-faint)]">{date}</div>
            </div>
          </Link>
        ))}
      </div>
      <Link href="/blog" className="mt-3 block text-[11.5px] font-medium text-[var(--primary)] hover:underline">
        View all featured posts →
      </Link>
    </div>
  );
}
