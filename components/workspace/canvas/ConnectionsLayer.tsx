"use client";

import { useLayoutEffect, useState } from "react";
import { useWorkflow } from "@/providers/workflow-provider";

function bezierPath(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.max(60, Math.abs(x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

export default function ConnectionsLayer({
  canvasRef,
  tempLine,
}: {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  tempLine: { x1: number; y1: number; x2: number; y2: number } | null;
}) {
  const { conns, nodes, scale, portRefs, removeConnection } = useWorkflow();
  const [paths, setPaths] = useState<{ id: string; d: string }[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      {/* invisible fat hitbox so a thin 2px line is still easy to click/hover */}
      {paths.map((p) => (
        <path
          key={`${p.id}-hit`}
          d={p.d}
          style={{ pointerEvents: "stroke", cursor: "pointer" }}
          stroke="transparent"
          strokeWidth={14}
          fill="none"
          onMouseEnter={() => setHoveredId(p.id)}
          onMouseLeave={() => setHoveredId((cur) => (cur === p.id ? null : cur))}
          onClick={() => removeConnection(p.id)}
        />
      ))}
      {paths.map((p) => (
        <path
          key={p.id}
          d={p.d}
          style={{ pointerEvents: "none", stroke: hoveredId === p.id ? "var(--danger)" : "var(--text-faint)" }}
          className="transition-colors duration-150"
          strokeWidth={2}
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
    </svg>
  );
}
