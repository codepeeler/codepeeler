import { Eye, MessageSquare } from "lucide-react";
import { CATEGORY_COLOR, type BlogPost } from "@/lib/data/blog";
import { cn } from "@/lib/utils";

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${n}`;
}

function AuthorAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(140deg,var(--secondary),var(--primary))] text-[9.5px] font-bold text-white">
      {initials}
    </div>
  );
}

/**
 * The single blog-post-card component used everywhere a post is listed —
 * both mobile and desktop Blog views render this, just in different grid
 * arrangements. If a card's look needs to change, it changes here once.
 */
export default function BlogPostCard({ post, compact = false }: { post: BlogPost; compact?: boolean }) {
  const color = CATEGORY_COLOR[post.category];

  return (
    <article className="flex flex-col overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--card)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-[var(--shadow-soft)] sm:flex-row">
      <div
        className={cn(
          "flex flex-shrink-0 items-center justify-center sm:w-[180px]",
          compact ? "h-28" : "h-32 sm:h-auto"
        )}
        style={{ background: `linear-gradient(150deg, color-mix(in srgb, ${color} 22%, transparent), transparent)` }}
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-[10px] border font-[family-name:var(--font-mono)] text-[13px] font-bold"
          style={{
            color,
            background: `color-mix(in srgb, ${color} 16%, transparent)`,
            borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
          }}
        >
          {"</>"}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span
          className="mb-1.5 w-fit rounded-[8px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em]"
          style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
        >
          {post.category}
        </span>
        <h3 className="mb-1 text-[14.5px] font-semibold leading-snug">{post.title}</h3>
        <p className="mb-3 line-clamp-2 text-[12.5px] leading-[1.5] text-[var(--text-faint)]">{post.desc}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-[var(--text-faint)]">
          <span className="flex items-center gap-1.5">
            <AuthorAvatar name={post.author} />
            {post.author}
          </span>
          <span>{post.date}</span>
          <span>{post.readTime}</span>
          <span className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye size={12} /> {formatCount(post.views)}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={12} /> {post.comments}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
