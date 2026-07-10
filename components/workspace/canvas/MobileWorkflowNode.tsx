"use client";

import { useCallback, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NODE_TYPES, NODE_CAT_COLOR } from "@/lib/data/node-types";
import { useWorkflow } from "@/providers/workflow-provider";
import type { WFNode } from "@/lib/types/workflow";

export const MOBILE_NODE_WIDTH = 268;

/**
 * Mobile-only node card. Visually and structurally distinct from the
 * desktop `WorkflowNode`: ports sit on the top (input) and bottom (output)
 * edges instead of left/right, matching a vertical, scroll-down workflow —
 * the natural reading direction on a phone. Desktop's `WorkflowNode` is
 * untouched; this component is only ever mounted from `MobileCanvasArea`.
 */
export default function MobileWorkflowNode({
  node,
  x,
  y,
  onStartConnection,
  pendingFrom,
  onCompletePending,
  onDragStateChange,
  onDragMove,
}: {
  node: WFNode;
  /** Display position — mobile's own vertical auto-layout plus any local
   *  drag override, NOT node.x/node.y (those stay desktop's). */
  x: number;
  y: number;
  onStartConnection: (nodeId: string, clientX: number, clientY: number) => void;
  pendingFrom?: string | null;
  onCompletePending?: (nodeId: string) => void;
  /** lets the parent canvas suspend its own pan-on-empty-space gesture
   *  while a node drag is in progress (both listen on the same pointer). */
  onDragStateChange?: (dragging: boolean) => void;
  /** reports incremental drag movement (canvas-space dx/dy) so the parent
   *  can keep a local display-position override — dragging on mobile
   *  never writes to the shared node.x/node.y that desktop reads. */
  onDragMove?: (nodeId: string, dx: number, dy: number) => void;
}) {
  const {
    scale,
    selectedIds,
    selectNode,
    beginDrag,
    deleteNode,
    registerPort,
    updateNodeValue,
  } = useWorkflow();
  const meta = NODE_TYPES[node.type];
  const color = NODE_CAT_COLOR[meta.cat];
  const selected = selectedIds.includes(node.id);
  const isDragging = useRef(false);

  const registerInPort = useCallback((el: HTMLDivElement | null) => registerPort(`${node.id}:in`, el), [node.id, registerPort]);
  const registerOutPort = useCallback((el: HTMLDivElement | null) => registerPort(`${node.id}:out`, el), [node.id, registerPort]);

  // Dragging the header (or anywhere on the card body, since there's no
  // separate "select" mode on mobile) moves the node. A tap that barely
  // moves still counts as a select, same forgiving threshold as desktop.
  const onCardPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-port]")) return;
      if ((e.target as HTMLElement).closest("textarea")) {
        selectNode(node.id);
        return;
      }
      e.stopPropagation();

      selectNode(node.id);
      beginDrag();

      let lastX = e.clientX;
      let lastY = e.clientY;
      let moved = false;
      isDragging.current = true;
      onDragStateChange?.(true);

      const prevBodyUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";

      const onMove = (ev: PointerEvent) => {
        const dx = (ev.clientX - lastX) / scale;
        const dy = (ev.clientY - lastY) / scale;
        if (Math.abs(ev.clientX - lastX) > 2 || Math.abs(ev.clientY - lastY) > 2) moved = true;
        lastX = ev.clientX;
        lastY = ev.clientY;
        if (moved) onDragMove?.(node.id, dx, dy);
      };
      const onUp = () => {
        isDragging.current = false;
        onDragStateChange?.(false);
        document.body.style.userSelect = prevBodyUserSelect;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [node.id, scale, selectNode, beginDrag, onDragMove, onDragStateChange]
  );

  const isPendingSource = pendingFrom === node.id;
  const isPendingTarget = !!pendingFrom && !isPendingSource && !meta.noInput;

  return (
    <div
      data-node-id={node.id}
      style={{ left: x, top: y, width: MOBILE_NODE_WIDTH, borderTopColor: color }}
      onPointerDown={onCardPointerDown}
      className={cn(
        "absolute z-[5] touch-none rounded-[14px] border border-[var(--border)] border-t-[3px] bg-[var(--card)] shadow-[var(--shadow-soft)]",
        selected && "border-[var(--primary)] shadow-[var(--shadow-glow)]"
      )}
    >
      {/* Input port — top edge, centered */}
      {!meta.noInput && (
        <div
          ref={registerInPort}
          data-port="in"
          data-node-id={node.id}
          onPointerDown={(e) => {
            e.stopPropagation();
            if (pendingFrom) onCompletePending?.(node.id);
          }}
          style={{ touchAction: "none" }}
          title={isPendingTarget ? "Tap to connect here" : undefined}
          className={cn(
            "absolute left-1/2 top-0 z-[6] flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center",
            isPendingTarget && "cursor-pointer"
          )}
        >
          <span
            className={cn(
              "h-4 w-4 flex-shrink-0 rounded-full border-2 border-[var(--text-faint)] bg-[var(--bg-elev)] transition-colors duration-150",
              isPendingTarget && "animate-pulse border-[var(--primary)] bg-[var(--primary)]"
            )}
          />
        </div>
      )}

      {/* Output port — bottom edge, centered */}
      {!meta.noOutput && (
        <div
          ref={registerOutPort}
          data-port="out"
          data-node-id={node.id}
          onPointerDown={(e) => {
            e.stopPropagation();
            onStartConnection(node.id, e.clientX, e.clientY);
          }}
          style={{ touchAction: "none" }}
          title="Drag down to connect, or tap then tap a target node's top dot"
          className="absolute bottom-0 left-1/2 z-[6] flex h-9 w-9 -translate-x-1/2 translate-y-1/2 items-center justify-center"
        >
          <span
            className={cn(
              "h-4 w-4 flex-shrink-0 rounded-full border-2 border-[var(--text-faint)] bg-[var(--bg-elev)] transition-colors duration-150",
              isPendingSource && "border-[var(--primary)] bg-[var(--primary)] ring-4 ring-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
            )}
          />
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-[var(--border-soft)] px-3 py-3">
        <span
          className={cn(
            "h-2 w-2 flex-shrink-0 rounded-full bg-[var(--text-faint)]",
            node.status === "ok" && "bg-[var(--success)]",
            node.status === "err" && "bg-[var(--danger)]",
            node.status === "busy" && "animate-pulse bg-[var(--warning)]"
          )}
        />
        <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-semibold">
          {meta.label}
        </div>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => deleteNode(node.id)}
          aria-label="Delete node"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[6px] text-[var(--text-faint)] active:bg-[var(--card-hover)] active:text-[var(--danger)]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-3 pb-3 pt-2.5">
        <div className="mb-1.5 text-[11px] leading-[1.4] text-[var(--text-faint)]">{meta.desc}</div>

        {node.type === "input" ? (
          <textarea
            value={node.value ?? ""}
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => updateNodeValue(node.id, e.target.value)}
            className="h-[64px] w-full resize-none touch-auto rounded-md border border-[var(--border)] bg-[var(--bg-elev)] p-2 font-[family-name:var(--font-mono)] text-[11px] leading-[1.5] text-[var(--text)] focus:border-[var(--primary)]"
          />
        ) : node.status === "err" ? (
          <div className="max-h-[76px] touch-auto overflow-y-auto rounded-md bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] p-2 font-[family-name:var(--font-mono)] text-[10.5px] leading-[1.5] text-[var(--danger)]">
            {node.output}
          </div>
        ) : node.status === "ok" ? (
          <div className="max-h-[76px] touch-auto overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--bg-elev)] p-2 font-[family-name:var(--font-mono)] text-[10.5px] leading-[1.5] text-[var(--text-dim)]">
            {node.output}
          </div>
        ) : (
          <div className="text-[11px] italic text-[var(--text-faint)]">
            {node.status === "busy" ? "Running…" : "Not run yet — press Run All"}
          </div>
        )}
      </div>
    </div>
  );
}
