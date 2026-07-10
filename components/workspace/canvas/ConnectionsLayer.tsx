"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useWorkflow } from "@/providers/workflow-provider";
import { useIsMobile } from "@/hooks/use-media-query";

function bezierPath(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.max(60, Math.abs(x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

export default function ConnectionsLayer({
  canvasRef,
  tempLine,
  selectedWireId,
  setSelectedWireId,
}: {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  tempLine: { x1: number; y1: number; x2: number; y2: number } | null;
  selectedWireId: string | null;
  setSelectedWireId: (id: string | null) => void;
}) {
  const { conns, nodes, scale, portRefs, removeConnection } = useWorkflow();
  const isMobile = useIsMobile();
  const [paths, setPaths] = useState<{ id: string; d: string }[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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
      next.push({ id: c.id, d: bezierPath(x1, y1, x2, y2) });
    });
    setPaths(next);
    // nodes is included so paths recompute while dragging (positions changing)
  }, [conns, nodes, scale, canvasRef, portRefs]);

  // Keep the mobile delete-badge glued to the midpoint of the selected wire
  // as it moves (node dragged, canvas zoomed, etc). Uses the real path
  // geometry (getPointAtLength) rather than an endpoint average, so it sits
  // correctly on curved wires too.
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
      {/* invisible fat hitbox so a thin 2px line is still easy to click/hover */}
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
          strokeWidth={isMobile ? 26 : 14}
          fill="none"
          onMouseEnter={() => !isMobile && setHoveredId(p.id)}
          onMouseLeave={() => !isMobile && setHoveredId((cur) => (cur === p.id ? null : cur))}
          onClick={() => {
            if (isMobile) {
              // First tap selects and reveals a delete badge (with a clear
              // undo-able affordance); a second tap on the same wire — or
              // the badge itself — actually removes it. This avoids a
              // stray finger silently deleting a wire with no feedback,
              // which is what a plain hover+click delete becomes on touch
              // (there's no hover state to warn you first).
              setSelectedWireId(selectedWireId === p.id ? null : p.id);
            } else {
              removeConnection(p.id);
            }
          }}
        />
      ))}
      {paths.map((p) => (
        <path
          key={p.id}
          d={p.d}
          style={{
            pointerEvents: "none",
            stroke:
              hoveredId === p.id || selectedWireId === p.id ? "var(--danger)" : "var(--text-faint)",
          }}
          className="transition-colors duration-150"
          strokeWidth={selectedWireId === p.id ? 2.5 : 2}
          fill="none"
        />
      ))}
      {tempLine && (
        <path
          d={bezierPath(tempLine.x1, tempLine.y1, tempLine.x2, tempLine.y2)}
          stroke="var(--primary)"
          strokeWidth={2}
          strokeDasharray="4 5"
          fill="none"
          opacity={0.8}
        />
      )}
      {isMobile && selectedWireId && badgePos && (
        <g
          transform={`translate(${badgePos.x}, ${badgePos.y})`}
          style={{ pointerEvents: "auto", cursor: "pointer" }}
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
