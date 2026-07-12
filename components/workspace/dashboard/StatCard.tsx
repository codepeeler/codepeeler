import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
      <div
        className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-[9px]"
        style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
      >
        <Icon size={17} />
      </div>
      <div className="text-[22px] font-bold leading-none">{value}</div>
      <div className="mt-1.5 text-[11.5px] text-[var(--text-faint)]">{label}</div>
    </div>
  );
}
