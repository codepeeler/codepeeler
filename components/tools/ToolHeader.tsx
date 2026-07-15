"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import CategoryBadge from "@/components/ui/CategoryBadge";
import { TOOLS, type CatKey } from "@/lib/data/tools";
import { recordToolVisit } from "@/lib/tool-usage";

type ToolHeaderProps = {
  cat: CatKey;
  badge: string;
  title: string;
  desc: string;
};

export default function ToolHeader({ cat, badge, title, desc }: ToolHeaderProps) {
  const pathname = usePathname();

  // Record a visit each time a tool page is opened, so "Popular tools" on
  // the landing page can reflect what this user actually reaches for.
  // Also mirror it to the account server-side (fire-and-forget, no-ops
  // silently when logged out) so it survives across devices and shows up
  // in the user's own dashboard and in the admin panel.
  useEffect(() => {
    if (!pathname) return;
    recordToolVisit(pathname);

    const tool = TOOLS.find((t) => t.page === pathname);
    if (tool) {
      fetch("/api/tools/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId: tool.id }),
      }).catch(() => {
        // best-effort — localStorage tracking above already covers this visit
      });
    }
  }, [pathname]);

  return (
    <div className="mb-6">
      <div className="mb-4 flex items-center gap-1 text-[12.5px] text-[var(--text-faint)]">
        <Link href="/tools" className="transition-colors duration-150 hover:text-[var(--text)]">
          Tools
        </Link>
        <ChevronRight size={13} />
        <span className="text-[var(--text-dim)]">{title}</span>
      </div>

      <div className="flex items-start gap-3.5">
        <CategoryBadge cat={cat} size="lg">
          {badge}
        </CategoryBadge>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-semibold tracking-[-0.01em]">
            {title}
          </h1>
          <p className="mt-1 max-w-[560px] text-[13.5px] leading-[1.5] text-[var(--text-dim)]">{desc}</p>
        </div>
      </div>
    </div>
  );
}
