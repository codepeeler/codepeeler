"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useWorkflow } from "@/providers/workflow-provider";

/** Vertical S-curve: control points pull the line straight down out of the
 *  source before curving into the target, matching a top-to-bottom flow
 *  (the desktop layer's `bezierPath` pulls sideways instead, for its
 *  left-to-right flow). */
function verticalBezierPath(x1: number, y1: number, x2: number, y2: number) {
  const dy = Math.max(50, Math.abs(y2 - y1) * 0.55);
  return `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
}

export default function MobileConnectionsLayer({
  canvasRef,
  tempLine,
  selectedWireId,
  setSelectedWireId,
  layoutVersion,
}: {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  tempLine: { x1: number; y1: number; x2: number; y2: number } | null;
  selectedWireId: string | null;
  setSelectedWireId: (id: string | null) => void;
  /** bumped on every node-drag tick so wires stay glued to ports while a
   *  node is being dragged — drag offsets live in MobileCanvasArea's local
   *  `dragOverrides` state, which this layer never subscribes to directly. */
  layoutVersion?: number;
}) {
  const { conns, nodes, scale, portRefs, removeConnection } = useWorkflow();
  const [paths, setPaths] = useState<{ id: string; d: string }[]>([]);
  const pathElRefs = useRef(new Map<string, SVGPathElement>());
  const [badgePos, setBadgePos] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvasRect = canvasEl.getBoundingClientRect();
    const next: { id: string; d: string }[] = [];
    conns.forEach((c) => {
      const outEl = portRefs.current.get(`${c.from}:out`);
      const inEl = portRefs.current.get(`${c.to}:in`);
      if (!outEl || !inEl) return;
      const outR = outEl.getBoundingClientRect();
      const inR = inEl.getBoundingClientRect();
      const x1 = (outR.left + outR.width / 2 - canvasRect.left) / scale;
      const y1 = (outR.top + outR.height / 2 - canvasRect.top) / scale;
      const x2 = (inR.left + inR.width / 2 - canvasRect.left) / scale;
      const y2 = (inR.top + inR.height / 2 - canvasRect.top) / scale;
      next.push({ id: c.id, d: verticalBezierPath(x1, y1, x2, y2) });
    });
    setPaths(next);
  }, [conns, nodes, scale, canvasRef, portRefs, layoutVersion]);

  useLayoutEffect(() => {
    if (!selectedWireId) {
      setBadgePos(null);
      return;
    }
    const el = pathElRefs.current.get(selectedWireId);
    if (!el || !conns.some((c) => c.id === selectedWireId)) {
      setBadgePos(null);
      return;
    }
    const len = el.getTotalLength();
    const mid = el.getPointAtLength(len / 2);
    setBadgePos({ x: mid.x, y: mid.y });
  }, [selectedWireId, paths, conns]);

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      {/* fat invisible hitbox — generous for a finger */}
      {paths.map((p) => (
        <path
          key={`${p.id}-hit`}
          ref={(el) => {
            if (el) pathElRefs.current.set(p.id, el);
            else pathElRefs.current.delete(p.id);
          }}
          d={p.d}
          style={{ pointerEvents: "stroke", cursor: "pointer" }}
          stroke="transparent"
          strokeWidth={30}
          fill="none"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            // First tap selects and reveals a delete badge; a second tap on
            // the same wire (or the badge) removes it — same forgiving,
            // no-silent-delete pattern as the desktop mobile behavior.
            setSelectedWireId(selectedWireId === p.id ? null : p.id);
          }}
        />
      ))}
      {paths.map((p) => (
        <path
          key={p.id}
          d={p.d}
          style={{
            pointerEvents: "none",
            stroke: selectedWireId === p.id ? "var(--danger)" : "var(--text-faint)",
          }}
          className="transition-colors duration-150"
          strokeWidth={selectedWireId === p.id ? 2.5 : 2}
          fill="none"
        />
      ))}
      {tempLine && (
        <path
          d={verticalBezierPath(tempLine.x1, tempLine.y1, tempLine.x2, tempLine.y2)}
          stroke="var(--primary)"
          strokeWidth={2}
          strokeDasharray="4 5"
          fill="none"
          opacity={0.8}
        />
      )}
      {selectedWireId && badgePos && (
        <g
          transform={`translate(${badgePos.x}, ${badgePos.y})`}
          style={{ pointerEvents: "auto", cursor: "pointer" }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            removeConnection(selectedWireId);
            setSelectedWireId(null);
          }}
        >
          <circle r={16} fill="var(--danger)" stroke="var(--bg)" strokeWidth={2.5} />
          <foreignObject x={-9} y={-9} width={18} height={18} style={{ pointerEvents: "none" }}>
            <X size={18} color="white" strokeWidth={2.5} />
          </foreignObject>
        </g>
      )}
    </svg>
  );
}
