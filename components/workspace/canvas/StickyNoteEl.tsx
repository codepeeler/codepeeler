"use client";

import { useCallback } from "react";
import { X } from "lucide-react";
import { useWorkflow } from "@/providers/workflow-provider";
import type { StickyNote } from "@/lib/types/workflow";

const COLOR_SWATCHES = ["#fde68a", "#bbf7d0", "#bfdbfe", "#fecdd3", "#e9d5ff"];

export default function StickyNoteEl({ sticky }: { sticky: StickyNote }) {
  const { scale, moveSticky, resizeSticky, updateStickyText, updateStickyColor, deleteSticky, mode } =
    useWorkflow();

  const onDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (mode === "hand") return;
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = sticky.x;
      const startTop = sticky.y;
      const onMove = (ev: PointerEvent) => {
        const dx = (ev.clientX - startX) / scale;
        const dy = (ev.clientY - startY) / scale;
        moveSticky(sticky.id, Math.max(0, startLeft + dx), Math.max(0, startTop + dy));
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [mode, scale, sticky.id, sticky.x, sticky.y, moveSticky]
  );

  const onResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = sticky.w;
      const startH = sticky.h;
      const onMove = (ev: PointerEvent) => {
        const dw = (ev.clientX - startX) / scale;
        const dh = (ev.clientY - startY) / scale;
        resizeSticky(sticky.id, startW + dw, startH + dh);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [scale, sticky.id, sticky.w, sticky.h, resizeSticky]
  );

  return (
    <div
      data-sticky-id={sticky.id}
      style={{ left: sticky.x, top: sticky.y, width: sticky.w, height: sticky.h, background: sticky.color }}
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute z-[4] flex flex-col rounded-[10px] shadow-[var(--shadow-soft)]"
    >
      <div onPointerDown={onDragStart} className="flex cursor-grab items-center gap-1 px-2 pb-0.5 pt-1.5 active:cursor-grabbing">
        <div className="flex flex-1 gap-1">
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => updateStickyColor(sticky.id, c)}
              style={{ background: c }}
              className="h-3 w-3 rounded-full border border-black/10"
              title="Change color"
            />
          ))}
        </div>
        <button
          onClick={() => deleteSticky(sticky.id)}
          className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] text-black/50 transition-colors duration-150 hover:bg-black/10 hover:text-black/80"
        >
          <X size={12} />
        </button>
      </div>

      <textarea
        value={sticky.text}
        onChange={(e) => updateStickyText(sticky.id, e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Type a note…"
        className="flex-1 resize-none bg-transparent px-2.5 pb-2.5 text-[12px] leading-[1.5] text-black/80 placeholder:text-black/40 focus:outline-none"
      />

      <div
        onPointerDown={onResizeStart}
        className="absolute bottom-0.5 right-0.5 h-3 w-3 cursor-nwse-resize rounded-sm bg-black/15"
      />
    </div>
  );
}
