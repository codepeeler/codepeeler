import { cn } from "@/lib/utils";

/** Top row of a tool panel: mode toggle / controls on the left, action buttons on the right. */
export function PanelToolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-soft)] p-4", className)}>
      {children}
    </div>
  );
}

/** Row of settings controls (selects, checkboxes, number fields) below the toolbar. */
export function PanelSettings({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-4 border-b border-[var(--border-soft)] px-4 py-3">{children}</div>;
}

/** Generic padded content area, used for the main input/output grid or custom content. */
export function PanelBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

/** Bottom status bar — character counts, error messages, hints. */
export function PanelFooter({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "danger" }) {
  return (
    <div
      className={cn(
        "border-t border-[var(--border-soft)] px-4 py-2.5 text-[12px]",
        tone === "danger" ? "text-[var(--danger)]" : "text-[var(--text-faint)]"
      )}
    >
      {children}
    </div>
  );
}
