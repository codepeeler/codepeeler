"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { CANVAS_H, CANVAS_W, useWorkflow } from "@/providers/workflow-provider";
import WorkflowNode from "@/components/workspace/canvas/WorkflowNode";
import ConnectionsLayer from "@/components/workspace/canvas/ConnectionsLayer";
import Minimap from "@/components/workspace/canvas/Minimap";
import StickyNoteEl from "@/components/workspace/canvas/StickyNoteEl";
import FrameEl from "@/components/workspace/canvas/FrameEl";
import VariablesPanel from "@/components/workspace/VariablesPanel";
import { useIsMobile } from "@/hooks/use-media-query";
import { useMobileShell } from "@/providers/mobile-shell-provider";
import { TOOL_PALETTE_PANEL_ID } from "@/components/workspace/ToolPalette";
import { cn } from "@/lib/utils";
import MobileCanvasArea from "@/components/workspace/canvas/MobileCanvasArea";

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

const TAP_MOVE_THRESHOLD = 10; // px of pointer travel below which a gesture counts as a "tap"
const LONG_PRESS_MS = 480;

// Mobile gets its own canvas implementation entirely (vertical
// scroll-driven layout, top/bottom ports, no select/hand mode, no
// minimap) rather than conditional branches sprinkled through this
// component — see MobileCanvasArea's file comment for why. `CanvasArea`
// below is just a switch between the two; it's the only part of this
// file that changed. `DesktopCanvasArea`'s body (renamed from the
// original default export, otherwise byte-for-byte identical) is the
// pre-existing desktop implementation, unmodified.
export default function CanvasArea() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileCanvasArea /> : <DesktopCanvasArea />;
}

function DesktopCanvasArea() {
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
    setPendingAddPosition,
    lastAddedNodeId,
    clearLastAddedNodeId,
  } = useWorkflow();
  const isMobile = useIsMobile();
  const { openPanel } = useMobileShell();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [tempConn, setTempConn] = useState<TempConn | null>(null);
  const [lasso, setLasso] = useState<LassoRect | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  // Mobile tap-to-connect: id of the node "armed" as a connection source
  // while the user finds the target node to tap next, as a forgiving
  // alternative to precision drag-to-connect on a touchscreen.
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);
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
        setPendingFrom(null);
        setSelectedWireId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIds, deleteSelected, selectNode, undo, redo]);

  // ---- smooth-scroll a freshly-added node into view (mobile "+" flow) ----
  useEffect(() => {
    if (!lastAddedNodeId) return;
    const el = canvasRef.current?.querySelector(`[data-node-id="${lastAddedNodeId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    clearLastAddedNodeId();
  }, [lastAddedNodeId, clearLastAddedNodeId]);

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

  // ---- pinch-to-zoom (two-finger touch) — there's no ctrl/cmd+wheel on a
  // touchscreen, so this is the only way mobile users can zoom the canvas.
  // Raw TouchEvent listeners (not React's synthetic touch props) so we can
  // call preventDefault without the passive-listener warning. ----
  const scaleRef = useRef(scale);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let startDist = 0;
    let startScale = 1;
    const dist = (touches: TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        startDist = dist(e.touches);
        startScale = scaleRef.current;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && startDist > 0) {
        e.preventDefault();
        const factor = dist(e.touches) / startDist;
        setScale(() => startScale * factor);
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) startDist = 0;
    };
    wrap.addEventListener("touchstart", onTouchStart, { passive: true });
    wrap.addEventListener("touchmove", onTouchMove, { passive: false });
    wrap.addEventListener("touchend", onTouchEnd, { passive: true });
    wrap.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      wrap.removeEventListener("touchstart", onTouchStart);
      wrap.removeEventListener("touchmove", onTouchMove);
      wrap.removeEventListener("touchend", onTouchEnd);
      wrap.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [setScale]);

  // ---- start a connection drag from an output port — called directly by
  // WorkflowNode's port (not via event-bubbling detection, which was unreliable) ----
  const handleStartConnection = useCallback(
    (fromId: string, clientX: number, clientY: number) => {
      // Tapping the already-armed source port again cancels the pending
      // tap-to-connect gesture instead of starting a fresh drag.
      if (pendingFrom === fromId) {
        setPendingFrom(null);
        return;
      }
      setPendingFrom(null);

      const outEl = portRefs.current.get(`${fromId}:out`);
      const canvasRect = canvasRef.current!.getBoundingClientRect();
      const rect = outEl ? outEl.getBoundingClientRect() : { left: clientX, top: clientY, width: 0, height: 0 };
      const x1 = (rect.left + rect.width / 2 - canvasRect.left) / scale;
      const y1 = (rect.top + rect.height / 2 - canvasRect.top) / scale;
      setTempConn({ from: fromId, x1, y1, x2: x1, y2: y1 });
      const prevBodyUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";

      const startClientX = clientX;
      const startClientY = clientY;

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
        const HIT_RADIUS = 40; // px — generous for a finger, still tight enough to disambiguate close nodes
        let bestId: string | null = null;
        let bestDist = HIT_RADIUS;
        portRefs.current.forEach((el, key) => {
          if (!key.endsWith(":in")) return;
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const d = Math.hypot(clientX - cx, clientY - cy);
          if (d <= bestDist) {
            bestDist = d;
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
          if (inPortEl?.dataset.nodeId) {
            addConnection(fromId, inPortEl.dataset.nodeId);
          } else {
            const totalTravel = Math.hypot(ev.clientX - startClientX, ev.clientY - startClientY);
            if (totalTravel < TAP_MOVE_THRESHOLD) {
              // Barely moved — read as "tap the source port" rather than a
              // failed drag. Arm tap-to-connect so the user can now tap
              // whichever target node's input dot they want, from anywhere
              // on the canvas (including after panning/scrolling to find
              // it) — much more forgiving than a single continuous drag.
              setPendingFrom(fromId);
            }
          }
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
    [scale, toCanvasPoint, addConnection, portRefs, pendingFrom]
  );

  const onCompletePending = useCallback(
    (targetId: string) => {
      if (!pendingFrom) return;
      addConnection(pendingFrom, targetId);
      setPendingFrom(null);
    },
    [pendingFrom, addConnection]
  );

  // ---- click empty canvas = deselect or place a pending sticky/frame; drag on
  // empty canvas = lasso multi-select; long-press on mobile = quick-add a node
  // at that exact spot ----
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

      // A pending tap-to-connect or a selected wire "consumes" the next
      // empty-canvas tap as a cancel, instead of starting a lasso.
      if (pendingFrom || selectedWireId) {
        setPendingFrom(null);
        setSelectedWireId(null);
        return;
      }

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
      const startClientX = e.clientX;
      const startClientY = e.clientY;
      let moved = false;
      // plain local variable — NOT React state — so we can read the latest
      // rect synchronously in onUp without nesting another setState call
      // inside setLasso's updater (that's what caused the "Cannot update a
      // component while rendering a different component" crash).
      let rect: LassoRect = { x1: start.x, y1: start.y, x2: start.x, y2: start.y };
      setLasso(rect);

      // Long-press-to-add: only armed on mobile in plain select mode. Any
      // real movement (the lasso actually being dragged) cancels it, same
      // as a native long-press gesture would.
      let longPressFired = false;
      const longPressTimer = isMobile
        ? window.setTimeout(() => {
            longPressFired = true;
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            document.body.style.userSelect = prevBodyUserSelect;
            setLasso(null);
            setPendingAddPosition(start);
            openPanel(TOOL_PALETTE_PANEL_ID);
          }, LONG_PRESS_MS)
        : 0;

      const onMove = (ev: PointerEvent) => {
        if (Math.abs(ev.clientX - startClientX) > 3 || Math.abs(ev.clientY - startClientY) > 3) {
          moved = true;
          if (longPressTimer) window.clearTimeout(longPressTimer);
        }
        const pt = toCanvasPoint(ev.clientX, ev.clientY);
        rect = { ...rect, x2: pt.x, y2: pt.y };
        setLasso(rect);
      };
      const onUp = () => {
        if (longPressTimer) window.clearTimeout(longPressTimer);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        document.body.style.userSelect = prevBodyUserSelect;
        setLasso(null);
        if (longPressFired) return;

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
    [
      mode,
      toCanvasPoint,
      nodes,
      scale,
      selectMany,
      selectNode,
      addSticky,
      addFrame,
      setMode,
      isMobile,
      pendingFrom,
      selectedWireId,
      setPendingAddPosition,
      openPanel,
    ]
  );

  // ---- double-click empty canvas to drop a node (desktop only — a
  // double-tap on mobile is ambiguous with pinch/zoom gestures and users
  // can't discover it anyway; long-press above is the mobile equivalent) ----
  const onCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return;
      if (e.target !== canvasRef.current) return;
      const pt = toCanvasPoint(e.clientX, e.clientY);
      addNode("json-format", pt.x, pt.y);
    },
    [toCanvasPoint, addNode, isMobile]
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
            <WorkflowNode
              key={n.id}
              node={n}
              onStartConnection={handleStartConnection}
              pendingFrom={pendingFrom}
              onCompletePending={onCompletePending}
            />
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
        <ConnectionsLayer
          canvasRef={canvasRef}
          tempLine={tempConn}
          selectedWireId={selectedWireId}
          setSelectedWireId={setSelectedWireId}
        />

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
              <span className="lg:hidden">
                Tap the <b>+</b> button to add a tool, or long-press anywhere on the canvas to drop
                one right here.
              </span>
              <span className="hidden lg:inline">
                Drag a tool in from the left, double-click the canvas, or press <b>A</b> to add a
                node.
              </span>
            </div>
          </div>
        )}
      </div>

      {minimapVisible && <Minimap wrapRef={wrapRef} />}
      <VariablesPanel />

      {pendingFrom && (
        <div className="pointer-events-none fixed left-1/2 top-[60px] z-[130] -translate-x-1/2 lg:top-[136px]">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] py-2 pl-4 pr-2 text-[12px] font-medium text-[var(--text)] shadow-[var(--shadow-soft)]">
            Tap a node&apos;s left dot to connect
            <button
              onClick={() => setPendingFrom(null)}
              aria-label="Cancel connecting"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--card-hover)] text-[var(--text-faint)] hover:text-[var(--text)]"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {isMobile && (
        <div className="fixed bottom-[calc(64px+16px)] left-4 z-[110] flex flex-col overflow-hidden rounded-full border border-[var(--border-soft)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
          <button
            onClick={() => setScale((s) => s + 0.15)}
            aria-label="Zoom in"
            className="flex h-11 w-11 items-center justify-center text-[var(--text)] active:bg-[var(--card-hover)]"
          >
            <Plus size={17} />
          </button>
          <div className="border-t border-[var(--border-soft)]" />
          <button
            onClick={() => setScale(1)}
            aria-label="Reset zoom"
            className="flex h-8 w-11 items-center justify-center text-[10px] font-semibold text-[var(--text-faint)] active:bg-[var(--card-hover)]"
          >
            {Math.round(scale * 100)}%
          </button>
          <div className="border-t border-[var(--border-soft)]" />
          <button
            onClick={() => setScale((s) => s - 0.15)}
            aria-label="Zoom out"
            className="flex h-11 w-11 items-center justify-center text-[var(--text)] active:bg-[var(--card-hover)]"
          >
            <Minus size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
