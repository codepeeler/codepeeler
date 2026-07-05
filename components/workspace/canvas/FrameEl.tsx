"use client";

import { useCallback } from "react";
import { X } from "lucide-react";
import { useWorkflow } from "@/providers/workflow-provider";
import type { CanvasFrame } from "@/lib/types/workflow";

export default function FrameEl({ frame }: { frame: CanvasFrame }) {
  const { scale, moveFrameBy, resizeFrame, renameFrame, deleteFrame, nodeIdsInFrame, moveManyBy, mode, beginDrag } =
    useWorkflow();

  const onDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (mode === "hand") return;
      e.stopPropagation();
      beginDrag();
      const containedIds = nodeIdsInFrame(frame);
      let lastX = e.clientX;
      let lastY = e.clientY;
      const onMove = (ev: PointerEvent) => {
        const dx = (ev.clientX - lastX) / scale;
        const dy = (ev.clientY - lastY) / scale;
        lastX = ev.clientX;
        lastY = ev.clientY;
        moveFrameBy(frame.id, dx, dy);
        if (containedIds.length > 0) moveManyBy(containedIds, dx, dy);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [mode, scale, frame, beginDrag, nodeIdsInFrame, moveFrameBy, moveManyBy]
  );

  const onResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = frame.w;
      const startH = frame.h;
      const onMove = (ev: PointerEvent) => {
        const dw = (ev.clientX - startX) / scale;
        const dh = (ev.clientY - startY) / scale;
        resizeFrame(frame.id, startW + dw, startH + dh);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [scale, frame.id, frame.w, frame.h, resizeFrame]
  );

  return (
    <div
      data-frame-id={frame.id}
      style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h }}
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute z-[1] rounded-[12px] border border-dashed border-[var(--border)] bg-[color-mix(in_srgb,var(--primary)_4%,transparent)]"
    >
      <div
        onPointerDown={onDragStart}
        className="flex h-7 w-fit min-w-[80px] max-w-full cursor-grab items-center gap-1.5 rounded-t-[10px] rounded-br-[8px] bg-[var(--card)] px-2.5 text-[11px] font-semibold text-[var(--text-dim)] shadow-[var(--shadow-soft)] active:cursor-grabbing"
      >
        <input
          value={frame.title}
          onChange={(e) => renameFrame(frame.id, e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-full min-w-[60px] bg-transparent focus:outline-none"
        />
        <button
          onClick={() => deleteFrame(frame.id)}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex h-[16px] w-[16px] flex-shrink-0 items-center justify-center rounded-[4px] text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--danger)]"
        >
          <X size={11} />
        </button>
      </div>

      <div
        onPointerDown={onResizeStart}
        className="absolute bottom-0.5 right-0.5 h-3 w-3 cursor-nwse-resize rounded-sm bg-[var(--border)]"
      />
    </div>
  );
}
