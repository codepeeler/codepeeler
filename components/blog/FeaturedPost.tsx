import { Sparkles, Zap, Database, Check } from "lucide-react";
import { MOCKUP_ICONS, type BlogPost } from "@/lib/data/blog";

/** Small static workflow-node mockup, built from the same card/icon-chip
 * language used across the app (CategoryBadge, ToolCard) rather than a new
 * visual system — purely decorative, no canvas/drag behavior needed here. */
function WorkflowMockup() {
  const nodes = [
    { Icon: MOCKUP_ICONS[0], color: "var(--warning)" },
    { Icon: Zap, color: "var(--primary)" },
    { Icon: Database, color: "var(--secondary)" },
    { Icon: Check, color: "var(--success)" },
  ];
  return (
    <div className="flex items-center gap-2.5">
      {nodes.map(({ Icon, color }, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] border"
            style={{
              color,
              background: `color-mix(in srgb, ${color} 16%, transparent)`,
              borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
            }}
          >
            <Icon size={18} />
          </div>
          {i < nodes.length - 1 && <div className="h-px w-4 bg-[var(--border)]" />}
        </div>
      ))}
    </div>
  );
}

export default function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--card)]">
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex-1">
          <span className="mb-3 flex w-fit items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--primary)]">
            <Sparkles size={11} /> Featured
          </span>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-[22px] font-bold leading-tight tracking-[-0.01em] sm:text-[26px]">
            {post.title}
          </h2>
          <p className="mb-4 max-w-[480px] text-[13.5px] leading-[1.6] text-[var(--text-dim)]">{post.desc}</p>
          <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-faint)]">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(140deg,var(--secondary),var(--primary))] text-[10px] font-bold text-white">
              {post.author
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </div>
            <span className="font-medium text-[var(--text-dim)]">{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center justify-center rounded-[12px] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6 sm:w-[260px]">
          <WorkflowMockup />
        </div>
      </div>
    </div>
  );
}
