"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useWorkflow } from "@/providers/workflow-provider";
import { MOBILE_NODE_WIDTH } from "@/components/workspace/canvas/MobileWorkflowNode";
import MobileWorkflowNode from "@/components/workspace/canvas/MobileWorkflowNode";
import MobileConnectionsLayer from "@/components/workspace/canvas/MobileConnectionsLayer";
import VariablesPanel from "@/components/workspace/VariablesPanel";
import { useMobileShell } from "@/providers/mobile-shell-provider";
import { TOOL_PALETTE_PANEL_ID } from "@/components/workspace/ToolPalette";
import type { WFNode } from "@/lib/types/workflow";

interface TempConn {
  from: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const TAP_MOVE_THRESHOLD = 10;
const LONG_PRESS_MS = 480;
const MOBILE_ROW_GAP = 210; // vertical distance between layers
const MOBILE_COL_GAP = MOBILE_NODE_WIDTH + 32; // horizontal distance between parallel branches
const MOBILE_CANVAS_PAD_X = 40;
const MOBILE_CANVAS_PAD_Y = 32;

/**
 * Desktop's `node.x`/`node.y` describe a left-to-right layout (see
 * `sampleNodes()` / `autoLayout` in the provider) — reusing those
 * coordinates as-is on mobile would render every workflow as a wide row
 * sitting mostly off-screen, exactly the sideways-scroll problem this
 * component exists to remove. So mobile computes its own top-to-bottom
 * layout from the connection graph (same BFS-layering idea as desktop's
 * `autoLayout`, just swapping which axis is "layer" vs "row"), and only
 * *displays* nodes at those coordinates. A node the user manually drags
 * gets a per-node override in local state so their arrangement sticks
 * for the session, without ever writing back into the shared node.x/y
 * that desktop reads — so nothing done here can move nodes around on
 * desktop.
 */
function computeVerticalLayout(nodes: WFNode[], conns: { from: string; to: string }[]) {
  const indegree = new Map<string, number>();
  nodes.forEach((n) => indegree.set(n.id, 0));
  conns.forEach((c) => indegree.set(c.to, (indegree.get(c.to) ?? 0) + 1));
  const adj = new Map<string, string[]>();
  conns.forEach((c) => {
    const arr = adj.get(c.from) ?? [];
    arr.push(c.to);
    adj.set(c.from, arr);
  });

  const layer = new Map<string, number>();
  const indegreeCopy = new Map(indegree);
  let frontier = nodes.filter((n) => (indegree.get(n.id) ?? 0) === 0).map((n) => n.id);
  frontier.forEach((id) => layer.set(id, 0));
  let depth = 0;
  while (frontier.length) {
    const next: string[] = [];
    frontier.forEach((id) => {
      (adj.get(id) ?? []).forEach((childId) => {
        indegreeCopy.set(childId, (indegreeCopy.get(childId) ?? 0) - 1);
        const candidateLayer = depth + 1;
        if (!layer.has(childId) || (layer.get(childId) ?? 0) < candidateLayer) {
          layer.set(childId, candidateLayer);
        }
        if (indegreeCopy.get(childId) === 0) next.push(childId);
      });
    });
    frontier = next;
    depth += 1;
  }
  nodes.forEach((n) => {
    if (!layer.has(n.id)) layer.set(n.id, 0);
  });

  const perLayerCount = new Map<number, number>();
  const layerOf = new Map<string, number>();
  nodes.forEach((n) => {
    const l = layer.get(n.id) ?? 0;
    layerOf.set(n.id, l);
    perLayerCount.set(l, (perLayerCount.get(l) ?? 0) + 1);
  });
  const maxCols = Math.max(1, ...Array.from(perLayerCount.values()));

  const seenPerLayer = new Map<number, number>();
  const positions = new Map<string, { x: number; y: number }>();
  nodes.forEach((n) => {
    const l = layerOf.get(n.id) ?? 0;
    const colsInLayer = perLayerCount.get(l) ?? 1;
    const col = seenPerLayer.get(l) ?? 0;
    seenPerLayer.set(l, col + 1);
    // Center this layer's row within the widest row in the whole layout,
    // so a typical single-column workflow sits centered with nothing to
    // scroll sideways for — extra columns only appear where a workflow
    // actually branches.
    const rowWidth = colsInLayer * MOBILE_COL_GAP;
    const maxRowWidth = maxCols * MOBILE_COL_GAP;
    const rowOffsetX = (maxRowWidth - rowWidth) / 2;
    positions.set(n.id, {
      x: MOBILE_CANVAS_PAD_X + rowOffsetX + col * MOBILE_COL_GAP,
      y: MOBILE_CANVAS_PAD_Y + l * MOBILE_ROW_GAP,
    });
  });
  return positions;
}

/**
 * Mobile-only workspace canvas. This is a deliberately separate component
 * from `CanvasArea` (the desktop implementation) rather than a set of
 * conditional branches inside it — the interaction model is different
 * enough (vertical scroll instead of free 2D pan as the primary gesture,
 * no select/hand mode switch, no minimap) that threading both through one
 * component would mean every future desktop tweak risks a mobile
 * regression and vice versa. `CanvasArea` itself only adds a two-line
 * branch at its top to render this instead — its own body is untouched.
 *
 * Panning: dragging empty canvas space scrolls the wrapper natively
 * (native touch scrolling, both axes) — no custom pan-mode needed since
 * there's no competing "select" tool to switch away from. Dragging a node
 * moves it (handled inside `MobileWorkflowNode`); dragging a wire's port
 * draws a connection. Pinch-to-zoom still works via the same two-finger
 * listener pattern as desktop.
 */
export default function MobileCanvasArea() {
  const {
    nodes,
    conns,
    scale,
    setScale,
    selectNode,
    addConnection,
    deleteSelected,
    selectedIds,
    portRefs,
    undo,
    redo,
    setPendingAddPosition,
    lastAddedNodeId,
    clearLastAddedNodeId,
  } = useWorkflow();
  const { openPanel } = useMobileShell();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [tempConn, setTempConn] = useState<TempConn | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);
  const [nodeDragging, setNodeDragging] = useState(false);
  // Per-node manual-drag offsets, layered on top of the computed vertical
  // auto-layout below. Session-local and mobile-only — never written back
  // to node.x/node.y, so desktop's layout is never touched from here.
  const [dragOverrides, setDragOverrides] = useState<Record<string, { x: number; y: number }>>({});
  // Sticky base-layout cache: keyed by node id, holds the last computed
  // base position for that node. `computeVerticalLayout` is a pure
  // function of (nodes, conns) — recomputing it from scratch is fine, but
  // *adopting* every node's freshly computed position on every conns
  // change is not: one new/removed wire can shift BFS layering for nodes
  // that had nothing to do with that edge, which read as "all the nodes
  // jump around" whenever the user connected or disconnected something.
  // We still run the full layout algorithm (the graph-aware layering is
  // worth it for placing brand-new nodes sensibly), but we only accept a
  // node's newly computed position when that node has no cached position
  // yet — i.e. only truly new nodes get freshly placed. Existing nodes
  // keep whatever base position they already had.
  const baseLayoutCacheRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const rawLayout = useMemo(() => computeVerticalLayout(nodes, conns), [nodes, conns]);
  const baseLayout = useMemo(() => {
    const cache = baseLayoutCacheRef.current;
    const liveIds = new Set(nodes.map((n) => n.id));
    Array.from(cache.keys()).forEach((id) => {
      if (!liveIds.has(id)) cache.delete(id);
    });
    nodes.forEach((n) => {
      if (!cache.has(n.id)) {
        const fresh = rawLayout.get(n.id);
        if (fresh) cache.set(n.id, fresh);
      }
    });
    return cache;
  }, [nodes, rawLayout]);
  // Bumped on every node-drag tick purely to force MobileConnectionsLayer
  // to recompute wire paths from live port positions while dragging —
  // dragOverrides changes don't touch `nodes`/`conns` so the layer's own
  // effect wouldn't otherwise re-run mid-drag, which is what made wires
  // look "torn" (stuck at the pre-drag port position) while moving a node.
  const [layoutVersion, setLayoutVersion] = useState(0);

  const displayPositions = useMemo(() => {
    const out = new Map<string, { x: number; y: number }>();
    nodes.forEach((n) => {
      const base = baseLayout.get(n.id) ?? { x: MOBILE_CANVAS_PAD_X, y: MOBILE_CANVAS_PAD_Y };
      const off = dragOverrides[n.id];
      out.set(n.id, off ? { x: base.x + off.x, y: base.y + off.y } : base);
    });
    return out;
  }, [nodes, baseLayout, dragOverrides]);

  const handleNodeDragMove = useCallback((nodeId: string, dx: number, dy: number) => {
    setDragOverrides((prev) => {
      const cur = prev[nodeId] ?? { x: 0, y: 0 };
      return { ...prev, [nodeId]: { x: cur.x + dx, y: cur.y + dy } };
    });
    setLayoutVersion((v) => v + 1);
  }, []);

  // Stale overrides for deleted nodes are simply skipped when computing
  // displayPositions above (nodes.forEach only ever looks up ids that
  // still exist) — no cleanup effect needed, so dragOverrides can just
  // accumulate and get filtered lazily on read.

  // Virtual canvas must be tall/wide enough to fit the deepest layer and
  // the widest row of the computed layout, with room to spare for manual
  // drags off to the side.
  const { canvasWidth, canvasHeight } = useMemo(() => {
    let maxX = 0;
    let maxY = 500;
    displayPositions.forEach((p) => {
      maxX = Math.max(maxX, p.x + MOBILE_NODE_WIDTH + MOBILE_CANVAS_PAD_X);
      maxY = Math.max(maxY, p.y + 260 + 200);
    });
    return { canvasWidth: Math.max(360, maxX), canvasHeight: maxY };
  }, [displayPositions]);

  const toCanvasPoint = useCallback(
    (clientX: number, clientY: number) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
    },
    [scale]
  );

  // ---- delete / escape shortcuts (external keyboard on mobile is rare but
  // harmless to support) ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
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

  // ---- smooth-scroll a freshly-added node into view ----
  useEffect(() => {
    if (!lastAddedNodeId) return;
    const el = canvasRef.current?.querySelector(`[data-node-id="${lastAddedNodeId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    clearLastAddedNodeId();
  }, [lastAddedNodeId, clearLastAddedNodeId]);

  // ---- pinch-to-zoom (two-finger touch) ----
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
        setScale(() => Math.min(2, Math.max(0.3, startScale * factor)));
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

  // ---- start a connection drag from an output port ----
  const handleStartConnection = useCallback(
    (fromId: string, clientX: number, clientY: number) => {
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

      const findNearestInPort = (clientX: number, clientY: number) => {
        const HIT_RADIUS = 46; // generous for a finger
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
            bestId = key.slice(0, -3);
          }
        });
        return bestId;
      };

      const finish = (ev: PointerEvent) => {
        const nearestId = findNearestInPort(ev.clientX, ev.clientY);
        if (nearestId) {
          addConnection(fromId, nearestId);
        } else {
          const dropEl = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null;
          const inPortEl = dropEl?.closest('[data-port="in"]') as HTMLElement | null;
          if (inPortEl?.dataset.nodeId) {
            addConnection(fromId, inPortEl.dataset.nodeId);
          } else {
            const totalTravel = Math.hypot(ev.clientX - startClientX, ev.clientY - startClientY);
            if (totalTravel < TAP_MOVE_THRESHOLD) {
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

  // ---- tap empty canvas = deselect / cancel pending connection or wire
  // selection; long-press empty canvas = quick-add a node right there.
  // A plain drag on empty space is left alone so it becomes native
  // scrolling (pan) — no lasso, no preventDefault, no mode switch. ----
  const onCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-node-id]") || target.closest("[data-port]")) return;

      if (pendingFrom || selectedWireId) {
        setPendingFrom(null);
        setSelectedWireId(null);
        return;
      }

      const start = toCanvasPoint(e.clientX, e.clientY);
      const startClientX = e.clientX;
      const startClientY = e.clientY;
      let longPressFired = false;
      let cancelled = false;

      const longPressTimer = window.setTimeout(() => {
        longPressFired = true;
        setPendingAddPosition(start);
        openPanel(TOOL_PALETTE_PANEL_ID);
      }, LONG_PRESS_MS);

      const onMove = (ev: PointerEvent) => {
        // Any real movement — even a couple px, well before the 10px tap
        // threshold — means this is the start of a scroll/pan gesture, not
        // a long-press-in-place. Cancel early so a slow scroll-start can't
        // sneak past the 480ms window and pop the tool palette open.
        if (Math.abs(ev.clientX - startClientX) > 3 || Math.abs(ev.clientY - startClientY) > 3) {
          cancelled = true;
          window.clearTimeout(longPressTimer);
        }
      };
      const onUp = () => {
        window.clearTimeout(longPressTimer);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (!longPressFired && !cancelled) {
          selectNode(null);
        }
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [toCanvasPoint, selectNode, pendingFrom, selectedWireId, setPendingAddPosition, openPanel]
  );

  return (
    <div
      ref={wrapRef}
      className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-[var(--bg)] bg-[radial-gradient(circle,var(--border-soft)_1px,transparent_1px)] bg-[length:24px_24px]"
      style={{ overscrollBehavior: "contain", touchAction: nodeDragging ? "none" : "pan-y" }}
    >
      <div
        ref={canvasRef}
        onPointerDown={onCanvasPointerDown}
        style={{
          width: canvasWidth,
          height: canvasHeight,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
        }}
        className="relative"
      >
        <div className="absolute inset-0">
          {nodes.map((n) => {
            const pos = displayPositions.get(n.id) ?? { x: MOBILE_CANVAS_PAD_X, y: MOBILE_CANVAS_PAD_Y };
            return (
              <MobileWorkflowNode
                key={n.id}
                node={n}
                x={pos.x}
                y={pos.y}
                onStartConnection={handleStartConnection}
                pendingFrom={pendingFrom}
                onCompletePending={onCompletePending}
                onDragStateChange={setNodeDragging}
                onDragMove={handleNodeDragMove}
              />
            );
          })}
        </div>

        <MobileConnectionsLayer
          canvasRef={canvasRef}
          tempLine={tempConn}
          selectedWireId={selectedWireId}
          setSelectedWireId={setSelectedWireId}
          layoutVersion={layoutVersion}
        />

        {nodes.length === 0 && (
          <div className="pointer-events-none absolute left-1/2 top-[30%] w-[260px] -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="mb-1.5 font-[family-name:var(--font-display)] text-[15px] font-semibold">
              Your canvas is empty
            </div>
            <div className="text-xs leading-[1.6] text-[var(--text-faint)]">
              Tap the <b>+</b> button to add a tool, or long-press anywhere on the canvas to drop one
              right here.
            </div>
          </div>
        )}
      </div>

      <VariablesPanel />

      {pendingFrom && (
        <div className="pointer-events-none fixed left-1/2 top-[60px] z-[130] -translate-x-1/2">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] py-2 pl-4 pr-2 text-[12px] font-medium text-[var(--text)] shadow-[var(--shadow-soft)]">
            Tap a node&apos;s top dot to connect
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

      {/* Zoom controls only — no minimap (pinch/buttons already cover
          zoom, and a small vertical-scroll workflow doesn't need a
          spatial overview the way a wide 2D desktop canvas does) and no
          select/hand toggle (there's nothing to switch between — a drag
          on a node always moves it, a drag on empty space always
          scrolls). */}
      <div className="fixed bottom-[calc(64px+16px)] left-4 z-[110] flex flex-col overflow-hidden rounded-full border border-[var(--border-soft)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
        <button
          onClick={() => setScale((s) => Math.min(2, s + 0.15))}
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
          onClick={() => setScale((s) => Math.max(0.3, s - 0.15))}
          aria-label="Zoom out"
          className="flex h-11 w-11 items-center justify-center text-[var(--text)] active:bg-[var(--card-hover)]"
        >
          <Minus size={17} />
        </button>
      </div>
    </div>
  );
}
