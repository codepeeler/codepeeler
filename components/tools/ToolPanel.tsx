import { cn } from "@/lib/utils";

export default function ToolPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-elev)]", className)}>
      {children}
    </div>
  );
}
