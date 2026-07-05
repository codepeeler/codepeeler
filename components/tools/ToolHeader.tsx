import Link from "next/link";
import { ChevronRight } from "lucide-react";
import CategoryBadge from "@/components/ui/CategoryBadge";
import type { CatKey } from "@/lib/data/tools";

type ToolHeaderProps = {
  cat: CatKey;
  badge: string;
  title: string;
  desc: string;
};

export default function ToolHeader({ cat, badge, title, desc }: ToolHeaderProps) {
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
