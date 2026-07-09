"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useMobileShell } from "@/providers/mobile-shell-provider";

type DrawerProps = {
  /** Unique id matching the id passed to openPanel/togglePanel elsewhere (e.g. a FAB or header action). */
  id: string;
  title: string;
  /** "side" slides in from the right (lists, filters, settings). "bottom" is a bottom-sheet (quick actions, single forms). */
  variant?: "side" | "bottom";
  children: React.ReactNode;
};

/**
 * Shared drawer/bottom-sheet used by every tool page on mobile. Position,
 * animation, overlay, and close behavior are fixed here so no individual
 * tool reimplements them — tools only supply `children`.
 */
export default function Drawer({ id, title, variant = "side", children }: DrawerProps) {
  const { activePanel, closePanel } = useMobileShell();
  const isOpen = activePanel === id;

  // Lock body scroll while a drawer is open, and allow Escape to close it.
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePanel();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closePanel]);

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[100] lg:hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Overlay */}
      <div
        onClick={closePanel}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={
          variant === "side"
            ? `absolute right-0 top-0 flex h-full w-[85vw] max-w-[340px] flex-col border-l border-[var(--border-soft)] bg-[var(--bg-elev)] shadow-[var(--shadow-soft)] transition-transform duration-200 ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`
            : `absolute bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-[18px] border-t border-[var(--border-soft)] bg-[var(--bg-elev)] shadow-[var(--shadow-soft)] transition-transform duration-200 ${
                isOpen ? "translate-y-0" : "translate-y-full"
              }`
        }
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--border-soft)] px-4 py-3.5">
          <span className="text-[14px] font-semibold text-[var(--text)]">{title}</span>
          <button
            onClick={closePanel}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-dim)] hover:bg-[var(--card-hover)]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
