"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CANVAS_H, CANVAS_W, useWorkflow } from "@/providers/workflow-provider";
import WorkflowNode from "@/components/workspace/canvas/WorkflowNode";
import ConnectionsLayer from "@/components/workspace/canvas/ConnectionsLayer";
import Minimap from "@/components/workspace/canvas/Minimap";
import StickyNoteEl from "@/components/workspace/canvas/StickyNoteEl";
import FrameEl from "@/components/workspace/canvas/FrameEl";
import VariablesPanel from "@/components/workspace/VariablesPanel";
import { cn } from "@/lib/utils";

interface TempConn {
  from: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
interface LassoRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function CanvasArea() {
  const {
    nodes,
    scale,
    setScale,
    mode,
    setMode,
    selectNode,
    selectMany,
    addConnection,
    addNode,
    deleteSelected,
    selectedIds,
    portRefs,
    minimapVisible,
    undo,
    redo,
    stickies,
    frames,
    addSticky,
    addFrame,
  } = useWorkflow();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [tempConn, setTempConn] = useState<TempConn | null>(null);
  const [lasso, setLasso] = useState<LassoRect | null>(null);
  const pendingZoomAnchor = useRef<{ clientX: number; clientY: number; beforeX: number; beforeY: number } | null>(
    null
  );

  const toCanvasPoint = useCallback(
    (clientX: number, clientY: number) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
    },
    [scale]
  );

  // ---- delete / escape / undo / redo keyboard shortcuts ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select";
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (typing) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === "Escape") {
        selectNode(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIds, deleteSelected, selectNode, undo, redo]);

  // ---- pan (hand mode: click-drag scrolls the wrap) ----
  const onWrapPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (mode !== "hand" || !wrapRef.current) return;
      const wrap = wrapRef.current;
      const startX = e.clientX;
      const startY = e.clientY;
      const startScrollLeft = wrap.scrollLeft;
      const startScrollTop = wrap.scrollTop;
      const onMove = (ev: PointerEvent) => {
        wrap.scrollLeft = startScrollLeft - (ev.clientX - startX);
        wrap.scrollTop = startScrollTop - (ev.clientY - startY);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [mode]
  );

  // ---- zoom (ctrl/cmd + wheel), anchored under the cursor ----
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const before = toCanvasPoint(e.clientX, e.clientY);
      pendingZoomAnchor.current = { clientX: e.clientX, clientY: e.clientY, beforeX: before.x, beforeY: before.y };
      setScale((s) => s + (e.deltaY < 0 ? 0.08 : -0.08));
    },
    [setScale, toCanvasPoint]
  );

  useLayoutEffect(() => {
    const anchor = pendingZoomAnchor.current;
    if (!anchor || !wrapRef.current || !canvasRef.current) return;
    pendingZoomAnchor.current = null;
    const after = toCanvasPoint(anchor.clientX, anchor.clientY);
    wrapRef.current.scrollLeft += (anchor.beforeX - after.x) * scale;
    wrapRef.current.scrollTop += (anchor.beforeY - after.y) * scale;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  // ---- start a connection drag from an output port — called directly by
  // WorkflowNode's port (not via event-bubbling detection, which was unreliable) ----
  const handleStartConnection = useCallback(
    (fromId: string, clientX: number, clientY: number) => {
      const outEl = portRefs.current.get(`${fromId}:out`);
      const canvasRect = canvasRef.current!.getBoundingClientRect();
      const rect = outEl ? outEl.getBoundingClientRect() : { left: clientX, top: clientY, width: 0, height: 0 };
      const x1 = (rect.left + rect.width / 2 - canvasRect.left) / scale;
      const y1 = (rect.top + rect.height / 2 - canvasRect.top) / scale;
      setTempConn({ from: fromId, x1, y1, x2: x1, y2: y1 });
      const prevBodyUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";

      const onMove = (ev: PointerEvent) => {
        const pt = toCanvasPoint(ev.clientX, ev.clientY);
        setTempConn((c) => (c ? { ...c, x2: pt.x, y2: pt.y } : c));
      };

      // Find whichever registered "in" port is physically closest to the
      // release point, rather than relying on document.elementFromPoint —
      // that DOM hit-test can land on an overlapping element (e.g. another
      // connection's invisible hit-stroke, or a neighbouring node edge)
      // even when the pointer is visually right on top of the target dot,
      // which was silently swallowing valid drops.
      const findNearestInPort = (clientX: number, clientY: number) => {
        const HIT_RADIUS = 26; // px, generous enough for a natural drop
        let bestId: string | null = null;
        let bestDist = HIT_RADIUS;
        portRefs.current.forEach((el, key) => {
          if (!key.endsWith(":in")) return;
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dist = Math.hypot(clientX - cx, clientY - cy);
          if (dist <= bestDist) {
            bestDist = dist;
            bestId = key.slice(0, -3); // strip trailing ":in"
          }
        });
        return bestId;
      };

      const finish = (ev: PointerEvent) => {
        const nearestId = findNearestInPort(ev.clientX, ev.clientY);
        if (nearestId) {
          addConnection(fromId, nearestId);
        } else {
          // fall back to a plain DOM hit-test in case the pointer ended up
          // somewhere the distance check didn't cover
          const dropEl = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null;
          const inPortEl = dropEl?.closest('[data-port="in"]') as HTMLElement | null;
          if (inPortEl?.dataset.nodeId) addConnection(fromId, inPortEl.dataset.nodeId);
        }
        setTempConn(null);
        document.body.style.userSelect = prevBodyUserSelect;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", finish);
      // some touch/trackpad interactions end in "pointercancel" instead of
      // "pointerup" (the browser deciding it was a scroll gesture) — without
      // handling it too, the drag state got stuck and the drop never counted
      window.addEventListener("pointercancel", finish);
    },
    [scale, toCanvasPoint, addConnection, portRefs]
  );

  // ---- click empty canvas = deselect or place a pending sticky/frame; drag on
  // empty canvas = lasso multi-select ----
  const onCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("[data-node-id]") ||
        target.closest("[data-port]") ||
        target.closest("[data-sticky-id]") ||
        target.closest("[data-frame-id]")
      )
        return;
      if (mode === "hand") return; // panning owns empty-space drags in hand mode

      if (mode === "place-sticky" || mode === "place-frame") {
        const pt = toCanvasPoint(e.clientX, e.clientY);
        if (mode === "place-sticky") addSticky(pt.x, pt.y);
        else addFrame(pt.x, pt.y);
        setMode("select");
        return;
      }

      // dragging an empty-canvas lasso box otherwise triggers the browser's
      // native text-selection drag (highlighting text in nodes, the sidebar,
      // anywhere on the page) since a plain mousedown+drag is indistinguishable
      // from "select this text" to the browser. Suppress that for the
      // duration of the drag.
      e.preventDefault();
      const prevBodyUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";

      const shiftKey = e.shiftKey;
      const start = toCanvasPoint(e.clientX, e.clientY);
      let moved = false;
      // plain local variable — NOT React state — so we can read the latest
      // rect synchronously in onUp without nesting another setState call
      // inside setLasso's updater (that's what caused the "Cannot update a
      // component while rendering a different component" crash).
      let rect: LassoRect = { x1: start.x, y1: start.y, x2: start.x, y2: start.y };
      setLasso(rect);

      const onMove = (ev: PointerEvent) => {
        if (Math.abs(ev.clientX - e.clientX) > 3 || Math.abs(ev.clientY - e.clientY) > 3) moved = true;
        const pt = toCanvasPoint(ev.clientX, ev.clientY);
        rect = { ...rect, x2: pt.x, y2: pt.y };
        setLasso(rect);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        document.body.style.userSelect = prevBodyUserSelect;
        setLasso(null);

        if (!moved) {
          if (!shiftKey) selectNode(null);
          return;
        }
        const minX = Math.min(rect.x1, rect.x2);
        const maxX = Math.max(rect.x1, rect.x2);
        const minY = Math.min(rect.y1, rect.y2);
        const maxY = Math.max(rect.y1, rect.y2);
        const canvasRect = canvasRef.current!.getBoundingClientRect();
        const hitIds = nodes
          .filter((n) => {
            const el = canvasRef.current!.querySelector(`[data-node-id="${n.id}"]`) as HTMLElement | null;
            if (!el) return false;
            const r = el.getBoundingClientRect();
            const nx1 = (r.left - canvasRect.left) / scale;
            const ny1 = (r.top - canvasRect.top) / scale;
            const nx2 = (r.right - canvasRect.left) / scale;
            const ny2 = (r.bottom - canvasRect.top) / scale;
            return nx1 < maxX && nx2 > minX && ny1 < maxY && ny2 > minY;
          })
          .map((n) => n.id);
        selectMany(hitIds, { additive: shiftKey });
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [mode, toCanvasPoint, nodes, scale, selectMany, selectNode, addSticky, addFrame, setMode]
  );

  // ---- double-click empty canvas to drop a node ----
  const onCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== canvasRef.current) return;
      const pt = toCanvasPoint(e.clientX, e.clientY);
      addNode("json-format", pt.x, pt.y);
    },
    [toCanvasPoint, addNode]
  );

  // ---- accept tools dropped from the palette ----
  const onCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/x-node-type");
      if (!type) return;
      const pt = toCanvasPoint(e.clientX, e.clientY);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addNode(type as any, pt.x, pt.y);
    },
    [toCanvasPoint, addNode]
  );

  return (
    <div
      ref={wrapRef}
      onPointerDown={onWrapPointerDown}
      onWheel={onWheel}
      className={cn(
        "relative min-w-0 flex-1 overflow-auto bg-[var(--bg)] bg-[radial-gradient(circle,var(--border-soft)_1px,transparent_1px)] bg-[length:24px_24px]",
        mode === "hand" && "cursor-grab active:cursor-grabbing",
        (mode === "place-sticky" || mode === "place-frame") && "cursor-crosshair"
      )}
    >
      <div
        ref={canvasRef}
        onPointerDown={onCanvasPointerDown}
        onDoubleClick={onCanvasDoubleClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onCanvasDrop}
        style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${scale})`, transformOrigin: "0 0" }}
        className="relative"
      >
        {frames.map((f) => (
          <FrameEl key={f.id} frame={f} />
        ))}

        <div className="absolute inset-0">
          {nodes.map((n) => (
            <WorkflowNode key={n.id} node={n} onStartConnection={handleStartConnection} />
          ))}
        </div>

        {/*
          ConnectionsLayer is declared AFTER the node list on purpose. React
          commits layout effects and attaches refs bottom-up in DOM/JSX
          source order — if this came first (as it originally did), its
          useLayoutEffect ran and read `portRefs` *before* the node ports
          below it had (re)attached their refs in that same commit, so it
          computed paths against a still-incomplete port map and the wire
          rendered as if unattached. Moving it after the nodes guarantees
          every port ref for this commit is already registered by the time
          this layer reads them. Visual stacking is unaffected: WorkflowNode
          uses an explicit z-index, so nodes still paint above this svg
          regardless of DOM order.
        */}
        <ConnectionsLayer canvasRef={canvasRef} tempLine={tempConn} />

        {stickies.map((s) => (
          <StickyNoteEl key={s.id} sticky={s} />
        ))}

        {lasso && (
          <div
            style={{
              left: Math.min(lasso.x1, lasso.x2),
              top: Math.min(lasso.y1, lasso.y2),
              width: Math.abs(lasso.x2 - lasso.x1),
              height: Math.abs(lasso.y2 - lasso.y1),
            }}
            className="pointer-events-none absolute z-[50] border border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]"
          />
        )}

        {nodes.length === 0 && (
          <div className="pointer-events-none absolute left-1/2 top-[40%] w-[280px] -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="mb-1.5 font-[family-name:var(--font-display)] text-[15px] font-semibold">
              Your canvas is empty
            </div>
            <div className="text-xs leading-[1.6] text-[var(--text-faint)]">
              Drag a tool in from the left, double-click the canvas, or press <b>A</b> to add
              a node.
            </div>
          </div>
        )}
      </div>

      {minimapVisible && <Minimap wrapRef={wrapRef} />}
      <VariablesPanel />
    </div>
  );
}
