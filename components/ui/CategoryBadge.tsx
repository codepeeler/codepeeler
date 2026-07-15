import { cn } from "@/lib/utils";
import type { CatKey } from "@/lib/data/tools";

const CAT_COLOR: Record<CatKey, string> = {
  data: "var(--cat-data)",
  encode: "var(--cat-encode)",
  gen: "var(--cat-gen)",
  web: "var(--cat-web)",
  image: "var(--cat-image)",
  sec: "var(--cat-sec)",
};

type CategoryBadgeProps = {
  cat: CatKey;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: "h-[30px] w-[30px] text-[10.5px] rounded-[8px]",
  md: "h-[38px] w-[38px] text-[13px] rounded-[10px]",
  lg: "h-11 w-11 text-sm rounded-[6px]",
};

export default function CategoryBadge({ cat, children, size = "md" }: CategoryBadgeProps) {
  const color = CAT_COLOR[cat];
  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center border font-[family-name:var(--font-mono)] font-bold tracking-[-0.02em]",
        SIZES[size]
      )}
      style={{
        color,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
      }}
    >
      {children}
    </div>
  );
}
