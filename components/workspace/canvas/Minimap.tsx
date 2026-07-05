"use client";

import { useEffect, useState } from "react";
import { useWorkflow, CANVAS_W, CANVAS_H } from "@/providers/workflow-provider";
import { NODE_TYPES, NODE_CAT_COLOR } from "@/lib/data/node-types";

const MM_W = 150;
const MM_H = 96;

export default function Minimap({ wrapRef }: { wrapRef: React.RefObject<HTMLDivElement | null> }) {
  const { nodes, scale, setScale } = useWorkflow();
  const [viewport, setViewport] = useState({ x: 0, y: 0, w: MM_W, h: MM_H });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const update = () => {
      const sx = (wrap.scrollLeft / scale / CANVAS_W) * MM_W;
      const sy = (wrap.scrollTop / scale / CANVAS_H) * MM_H;
      const sw = (wrap.clientWidth / scale / CANVAS_W) * MM_W;
      const sh = (wrap.clientHeight / scale / CANVAS_H) * MM_H;
      setViewport({ x: sx, y: sy, w: sw, h: sh });
    };
    update();
    wrap.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      wrap.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [wrapRef, scale, nodes]);

  const pct = Math.round(scale * 100);

  return (
    <div className="pointer-events-none absolute bottom-3.5 right-3.5 z-[45] flex flex-col items-end gap-1.5">
      <div className="pointer-events-auto h-24 w-[150px] overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
        <svg viewBox={`0 0 ${MM_W} ${MM_H}`} className="h-full w-full">
          {nodes.map((n) => {
            const meta = NODE_TYPES[n.type];
            const x = (n.x / CANVAS_W) * MM_W;
            const y = (n.y / CANVAS_H) * MM_H;
            return (
              <rect
                key={n.id}
                x={x}
                y={y}
                width={5}
                height={3}
                rx={0.6}
                fill={NODE_CAT_COLOR[meta.cat]}
              />
            );
          })}
          <rect
            x={Math.max(0, viewport.x)}
            y={Math.max(0, viewport.y)}
            width={Math.min(MM_W, viewport.w)}
            height={Math.min(MM_H, viewport.h)}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={1}
          />
        </svg>
      </div>
      <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] p-[3px]">
        <button
          onClick={() => setScale((s) => s - 0.1)}
          className="flex h-[22px] w-[22px] items-center justify-center rounded-md text-[13px] text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
        >
          −
        </button>
        <span className="w-8 text-center font-[family-name:var(--font-mono)] text-[10px] font-semibold text-[var(--text-dim)]">
          {pct}%
        </span>
        <button
          onClick={() => setScale((s) => s + 0.1)}
          className="flex h-[22px] w-[22px] items-center justify-center rounded-md text-[13px] text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
        >
          +
        </button>
      </div>
    </div>
  );
}
