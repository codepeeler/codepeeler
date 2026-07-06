import { cn } from "@/lib/utils";

type FieldBoxProps = {
  label: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  height?: string;
  scroll?: boolean;
  className?: string;
};

/**
 * The single "labeled box" shape reused across every tool page: a bordered
 * card with an uppercase label (+ optional right-aligned control) in the
 * header, and a content area below. Wraps textareas, <pre> output, tables,
 * trees, or any custom content.
 */
export default function FieldBox({ label, right, children, height, scroll = true, className }: FieldBoxProps) {
  return (
    <div className={cn("overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)]", className)}>
      <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-faint)]">{label}</span>
        {right}
      </div>
      <div style={height ? { height } : undefined} className={scroll ? "overflow-auto" : undefined}>
        {children}
      </div>
    </div>
  );
}
