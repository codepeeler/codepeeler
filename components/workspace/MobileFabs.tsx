"use client";

import { PanelLeft, PanelRight } from "lucide-react";

export default function MobileFabs() {
  // TODO Phase 2: wire these to open the palette/inspector as slide-over drawers on mobile
  return (
    <div className="fixed bottom-5 right-5 z-[120] flex flex-col gap-2.5 lg:hidden">
      <button
        title="Open tool palette"
        aria-label="Open tool palette"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-[var(--shadow-soft)]"
      >
        <PanelLeft size={19} />
      </button>
      <button
        title="Open panel"
        aria-label="Open inspector panel"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-[var(--shadow-soft)]"
      >
        <PanelRight size={19} />
      </button>
    </div>
  );
}
