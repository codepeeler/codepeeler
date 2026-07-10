"use client";

import { PanelLeft, PanelRight, Terminal } from "lucide-react";
import { useMobileShell } from "@/providers/mobile-shell-provider";
import { TOOL_PALETTE_PANEL_ID } from "@/components/workspace/ToolPalette";
import { INSPECTOR_PANEL_ID } from "@/components/workspace/Inspector";
import { BOTTOM_PANEL_ID } from "@/components/workspace/BottomPanel";

/**
 * Floating shortcut buttons for the workspace canvas specifically — the
 * canvas is the one page where content fills the whole screen and a
 * fixed header would get in the way of drawing/dragging, so these floating
 * buttons (rather than MobileHeader icons) open the same shared drawers.
 */
export default function MobileFabs() {
  const { togglePanel } = useMobileShell();

  return (
    <div className="fixed bottom-[calc(64px+16px)] right-4 z-[120] flex flex-col gap-2.5 lg:hidden">
      <button
        onClick={() => togglePanel(TOOL_PALETTE_PANEL_ID)}
        title="Open tool palette"
        aria-label="Open tool palette"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-[var(--shadow-soft)]"
      >
        <PanelLeft size={19} />
      </button>
      <button
        onClick={() => togglePanel(INSPECTOR_PANEL_ID)}
        title="Open inspector panel"
        aria-label="Open inspector panel"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-[var(--shadow-soft)]"
      >
        <PanelRight size={19} />
      </button>
      <button
        onClick={() => togglePanel(BOTTOM_PANEL_ID)}
        title="Open console"
        aria-label="Open console"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card)] text-[var(--text)] shadow-[var(--shadow-soft)] ring-1 ring-[var(--border-soft)]"
      >
        <Terminal size={18} />
      </button>
    </div>
  );
}
