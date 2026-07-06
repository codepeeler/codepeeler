import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-9 w-9 rounded-[9px]",
  md: "h-11 w-11 rounded-[10px]",
  lg: "h-12 w-12 rounded-[12px]",
};

const ICON_SIZES = {
  sm: 16,
  md: 19,
  lg: 21,
};

export default function CollectionIcon({
  icon: Icon,
  color,
  size = "md",
}: {
  icon: LucideIcon;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={cn("flex flex-shrink-0 items-center justify-center border", SIZES[size])}
      style={{
        color,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      <Icon size={ICON_SIZES[size]} strokeWidth={2} />
    </div>
  );
}
