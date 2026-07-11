"use client";

import { ChevronLeft } from "lucide-react";
import ThemeToggle from "@/components/core/ThemeToggle";

export type MobileHeaderAction = {
  key: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  /** Small colored dot to indicate active/unsaved state, e.g. on the environment icon. */
  active?: boolean;
};

type MobileHeaderProps = {
  title: string;
  onBack?: () => void;
  actions?: MobileHeaderAction[];
};

/**
 * Fixed header format used by every page in the mobile shell: optional back
 * button on the left, title in the center-left, and up to a few icon actions
 * on the right (each action typically opens a Drawer via useMobileShell),
 * followed by the dark/light theme toggle as the last, rightmost item —
 * added here once so every page gets it for free instead of each page
 * having to pass it in as one more action.
 */
export default function MobileHeader({ title, onBack, actions = [] }: MobileHeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 flex h-[52px] flex-shrink-0 items-center gap-2 border-b border-[var(--border-soft)] bg-[var(--bg)]/90 px-3 backdrop-blur-md lg:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[var(--text-dim)] hover:bg-[var(--card-hover)]"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <span className="flex-1 truncate text-[15px] font-semibold text-[var(--text)]">{title}</span>
      <div className="flex flex-shrink-0 items-center gap-1">
        <ThemeToggle />
        {actions.map((a) => (
          <button
            key={a.key}
            onClick={a.onClick}
            aria-label={a.label}
            title={a.label}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-dim)] hover:bg-[var(--card-hover)]"
          >
            <a.icon size={19} />
            {a.active && (
              <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full bg-[var(--primary)]" />
            )}
          </button>
        ))}
      </div>
    </header>
  );
}
