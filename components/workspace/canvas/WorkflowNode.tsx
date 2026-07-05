"use client";

import { useCallback, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NODE_TYPES, NODE_CAT_COLOR } from "@/lib/data/node-types";
import { NODE_WIDTH, useWorkflow } from "@/providers/workflow-provider";
import type { WFNode } from "@/lib/types/workflow";

export default function WorkflowNode({
  node,
  onStartConnection,
}: {
  node: WFNode;
  onStartConnection: (nodeId: string, clientX: number, clientY: number) => void;
}) {
  const {
    scale,
    selectedIds,
    selectNode,
    moveManyBy,
    beginDrag,
    deleteNode,
    mode,
    registerPort,
    updateNodeValue,
  } = useWorkflow();
  const meta = NODE_TYPES[node.type];
  const color = NODE_CAT_COLOR[meta.cat];
  const selected = selectedIds.includes(node.id);
  const isDragging = useRef(false);

  // Stable per-node ref callbacks. An inline `(el) => registerPort(...)` gets
  // a brand-new function identity on every render, which makes React detach
  // the old ref (null) and reattach the new one on every single re-render —
  // pointless churn that (combined with effect ordering elsewhere) could let
  // ConnectionsLayer observe the port map mid-detach. Keying the callback on
  // node.id keeps its identity stable across re-renders, so the ref is only
  // attached once on mount and detached once on unmount.
  const registerInPort = useCallback((el: HTMLDivElement | null) => registerPort(`${node.id}:in`, el), [node.id, registerPort]);
  const registerOutPort = useCallback((el: HTMLDivElement | null) => registerPort(`${node.id}:out`, el), [node.id, registerPort]);

  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (mode === "hand") return; // pan mode: let the canvas wrapper handle it
      e.stopPropagation();

      if (e.shiftKey) {
        selectNode(node.id, { additive: true });
        return; // shift-click only toggles selection, it doesn't start a drag
      }

      const isPartOfGroup = selected && selectedIds.length > 1;
      if (!isPartOfGroup) selectNode(node.id);
      beginDrag();

      const groupIds = isPartOfGroup ? selectedIds : [node.id];
      let lastX = e.clientX;
      let lastY = e.clientY;
      isDragging.current = true;

      const prevBodyUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";

      const onMove = (ev: PointerEvent) => {
        const dx = (ev.clientX - lastX) / scale;
        const dy = (ev.clientY - lastY) / scale;
        lastX = ev.clientX;
        lastY = ev.clientY;
        moveManyBy(groupIds, dx, dy);
      };
      const onUp = () => {
        isDragging.current = false;
        document.body.style.userSelect = prevBodyUserSelect;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [mode, node.id, scale, selected, selectedIds, selectNode, beginDrag, moveManyBy]
  );

  const onBodyPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      selectNode(node.id, { additive: e.shiftKey });
    },
    [node.id, selectNode]
  );

  return (
    <div
      data-node-id={node.id}
      style={{ left: node.x, top: node.y, width: NODE_WIDTH, borderTopColor: color }}
      onPointerDown={onBodyPointerDown}
      className={cn(
        "absolute z-[5] rounded-[12px] border border-[var(--border)] border-t-[2.5px] bg-[var(--card)] shadow-[var(--shadow-soft)]",
        selected && "border-[var(--primary)] shadow-[var(--shadow-glow)]"
      )}
    >
      {!meta.noInput && (
        <div
          ref={registerInPort}
          data-port="in"
          data-node-id={node.id}
          onPointerDown={(e) => e.stopPropagation()}
          style={{ touchAction: "none" }}
          className="absolute left-[-7px] top-1/2 z-[6] h-3 w-3 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-[var(--text-faint)] bg-[var(--bg-elev)] transition-colors duration-150 hover:border-[var(--primary)] hover:bg-[var(--primary)]"
        />
      )}
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
          className="absolute right-[-7px] top-1/2 z-[6] h-3 w-3 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-[var(--text-faint)] bg-[var(--bg-elev)] transition-colors duration-150 hover:border-[var(--primary)] hover:bg-[var(--primary)]"
        />
      )}

      <div
        onPointerDown={onHeaderPointerDown}
        className="flex cursor-grab items-center gap-2 border-b border-[var(--border-soft)] px-[9px] py-[9px] active:cursor-grabbing"
      >
        <span
          className={cn(
            "h-[7px] w-[7px] flex-shrink-0 rounded-full bg-[var(--text-faint)]",
            node.status === "ok" && "bg-[var(--success)]",
            node.status === "err" && "bg-[var(--danger)]",
            node.status === "busy" && "animate-pulse bg-[var(--warning)]"
          )}
        />
        <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] font-semibold">
          {meta.label}
        </div>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => deleteNode(node.id)}
          className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--danger)]"
        >
          <X size={12} />
        </button>
      </div>

      <div className="px-2.5 pb-2.5 pt-2.5">
        <div className="mb-1.5 text-[10px] leading-[1.4] text-[var(--text-faint)]">{meta.desc}</div>

        {node.type === "input" ? (
          <textarea
            value={node.value ?? ""}
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => updateNodeValue(node.id, e.target.value)}
            className="h-[60px] w-full resize-none rounded-md border border-[var(--border)] bg-[var(--bg-elev)] p-2 font-[family-name:var(--font-mono)] text-[10.5px] leading-[1.5] text-[var(--text)] focus:border-[var(--primary)]"
          />
        ) : node.status === "err" ? (
          <div className="max-h-[70px] overflow-y-auto rounded-md bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] p-2 font-[family-name:var(--font-mono)] text-[10px] leading-[1.5] text-[var(--danger)]">
            {node.output}
          </div>
        ) : node.status === "ok" ? (
          <div className="max-h-[70px] overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--bg-elev)] p-2 font-[family-name:var(--font-mono)] text-[10px] leading-[1.5] text-[var(--text-dim)]">
            {node.output}
          </div>
        ) : (
          <div className="text-[10.5px] italic text-[var(--text-faint)]">
            {node.status === "busy" ? "Running…" : "Not run yet — press Run All"}
          </div>
        )}
      </div>
    </div>
  );
}
