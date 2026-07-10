"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { NODE_TYPES, NODE_CAT_COLOR, PALETTE_GROUPS, type NodeTypeId } from "@/lib/data/node-types";
import { useWorkflow, CANVAS_W } from "@/providers/workflow-provider";
import Drawer from "@/components/layout/mobile/Drawer";

export const TOOL_PALETTE_PANEL_ID = "tool-palette";

const CAT_CHIPS = [
  { key: "all", label: "All" },
  { key: "flow", label: "Flow" },
  { key: "data", label: "Data" },
  { key: "encode", label: "Encode" },
  { key: "web", label: "Web" },
  { key: "text", label: "Text" },
  { key: "sec", label: "Security" },
  { key: "gen", label: "Gen" },
  { key: "image", label: "Image" },
] as const;

function ToolPaletteContent() {
  const { addNode, paletteWidth, setPaletteWidth } = useWorkflow();
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PALETTE_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((id) => {
        const meta = NODE_TYPES[id];
        if (activeCat !== "all" && meta.cat !== activeCat) return false;
        if (q && !meta.label.toLowerCase().includes(q) && !meta.desc.toLowerCase().includes(q)) return false;
        return true;
      }),
    })).filter((g) => g.items.length > 0);
  }, [activeCat, query]);

  return (
    <>
      <div className="px-3 pb-2 pt-3">
        <div className="mb-0.5 font-[family-name:var(--font-display)] text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--text-faint)]">
          Tools
        </div>
      </div>

      <div className="mx-3 mb-[9px] flex h-8 items-center gap-[7px] rounded-lg border border-[var(--border)] bg-[var(--card)] px-[9px]">
        <Search size={13} className="flex-shrink-0 text-[var(--text-faint)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search tools…"
          className="flex-1 bg-transparent text-xs text-[var(--text)] placeholder:text-[var(--text-faint)]"
        />
      </div>

      <div className="flex flex-wrap gap-[5px] px-3 pb-2.5">
        {CAT_CHIPS.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCat(c.key)}
            className={cn(
              "rounded-full border border-[var(--border)] bg-[var(--card)] px-[9px] py-[4.5px] text-[10.5px] font-semibold text-[var(--text-faint)] transition-colors duration-150 hover:text-[var(--text)]",
              activeCat === c.key && "border-transparent bg-[var(--primary)] text-white"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="mb-1 mt-2.5 px-2 text-[10.5px] font-bold uppercase tracking-[0.06em] text-[var(--text-faint)]">
              {group.label}
            </div>
            {group.items.map((id) => {
              const meta = NODE_TYPES[id];
              return (
                <div
                  key={id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("application/x-node-type", id)}
                  onDoubleClick={() => addNode(id, CANVAS_W / 4, 120 + Math.random() * 300)}
                  title="Drag onto the canvas, or double-click to add"
                  className="relative flex cursor-grab items-center gap-2 rounded-lg border border-transparent px-[7px] py-[7px] transition-colors duration-150 hover:border-[var(--border)] hover:bg-[var(--card-hover)] active:cursor-grabbing"
                >
                  <span
                    style={{ color: NODE_CAT_COLOR[meta.cat], background: `color-mix(in srgb, ${NODE_CAT_COLOR[meta.cat]} 14%, transparent)`, borderColor: `color-mix(in srgb, ${NODE_CAT_COLOR[meta.cat]} 35%, transparent)` }}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] border font-[family-name:var(--font-mono)] text-[11px] font-bold"
                  >
                    {meta.badge}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold">{meta.label}</div>
                    <div className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-[var(--text-faint)]">
                      {meta.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {groups.length === 0 && (
          <div className="px-2 py-6 text-center text-[11px] text-[var(--text-faint)]">
            No tools match &quot;{query}&quot;
          </div>
        )}
      </div>

      <div className="mx-3 mb-1 mt-2 rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] px-[10px] py-[9px] text-[10px] leading-[1.5] text-[var(--text-faint)]">
        Tip: drag from a node&apos;s right-hand dot to another node&apos;s left-hand dot to
        connect them.
      </div>
    </>
  );
}

/**
 * Desktop: fixed-width resizable aside (unchanged behavior).
 * Mobile (<lg): rendered inside the shared Drawer, opened via the tool
 * palette icon in the workspace MobileHeader, or the panel FAB.
 * (Drag-to-canvas from the palette is a desktop-only interaction; on
 * mobile, double-tap still adds a node to the canvas as before.)
 */
export default function ToolPalette() {
  const { paletteWidth, setPaletteWidth } = useWorkflow();

  const onResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = paletteWidth;
    const onMove = (ev: PointerEvent) => setPaletteWidth(startWidth + (ev.clientX - startX));
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <>
      <aside
        style={{ width: paletteWidth }}
        className="relative z-30 hidden flex-shrink-0 flex-col border-r border-[var(--border-soft)] bg-[var(--bg-elev)] lg:flex"
      >
        <ToolPaletteContent />
        <div
          onPointerDown={onResizeStart}
          className="absolute right-[-3px] top-0 z-[35] h-full w-1.5 cursor-col-resize hover:bg-[var(--primary)]"
        />
      </aside>
      <Drawer id={TOOL_PALETTE_PANEL_ID} title="Tools">
        <ToolPaletteContent />
      </Drawer>
    </>
  );
}
