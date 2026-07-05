"use client";

import { useState } from "react";
import { MousePointer2, Hand, Search, StickyNote, Frame, Braces, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflow } from "@/providers/workflow-provider";

const MODES = [
  { key: "select" as const, label: "Select tool (V)", icon: MousePointer2 },
  { key: "hand" as const, label: "Pan tool — hold Space", icon: Hand },
];

export default function CanvasToolbar() {
  const {
    mode,
    setMode,
    minimapVisible,
    setMinimapVisible,
    variablesPanelOpen,
    setVariablesPanelOpen,
    autoLayout,
    nodes,
  } = useWorkflow();
  const [snapOn, setSnapOn] = useState(false);

  const TOGGLES = [
    {
      key: "sticky",
      label: "Sticky Note",
      icon: StickyNote,
      title: "Click, then click the canvas to drop a sticky note",
      active: mode === "place-sticky",
      onClick: () => setMode(mode === "place-sticky" ? "select" : "place-sticky"),
      disabled: false,
    },
    {
      key: "frame",
      label: "Frame",
      icon: Frame,
      title: "Click, then click the canvas to drop a frame",
      active: mode === "place-frame",
      onClick: () => setMode(mode === "place-frame" ? "select" : "place-frame"),
      disabled: false,
    },
    {
      key: "vars",
      label: "Variables",
      icon: Braces,
      title: "Global variables you can reuse across the workflow",
      active: variablesPanelOpen,
      onClick: () => setVariablesPanelOpen((v) => !v),
      disabled: false,
    },
    {
      key: "layout",
      label: "Auto Layout",
      icon: LayoutGrid,
      title: "Automatically arrange nodes left-to-right by flow order",
      active: false,
      onClick: () => autoLayout(),
      disabled: nodes.length === 0,
    },
  ];

  return (
    <div className="flex h-12 flex-shrink-0 items-center gap-2 overflow-x-auto border-b border-[var(--border-soft)] bg-[var(--bg)] px-3.5">
      <div className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[7px] border border-dashed border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-[11.5px] font-medium text-[var(--text-faint)]">
        + Add Node{" "}
        <span className="rounded-[5px] border border-[var(--border)] bg-[var(--border-soft)] px-[5px] py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-[var(--text-faint)]">
          Double-click
        </span>
      </div>

      {/* Marquee/lasso multi-select is implicit in "select" mode: drag on empty
          canvas space selects everything inside the rectangle. */}
      <div className="flex flex-shrink-0 items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-0.5">
        {MODES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            title={label}
            onClick={() => setMode(key)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-faint)] transition-colors duration-150 hover:text-[var(--text)]",
              mode === key && "bg-[var(--primary)] text-white hover:text-white"
            )}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>

      <div className="flex h-7 flex-shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border-soft)] bg-[var(--card)] px-2">
        <Search size={13} className="flex-shrink-0 text-[var(--text-faint)]" />
        <input
          type="text"
          placeholder="Find node on canvas…"
          className="w-[120px] bg-transparent text-[11.5px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
        />
      </div>

      <div className="ml-auto flex flex-shrink-0 items-center gap-1.5">
        {TOGGLES.map((t) => (
          <button
            key={t.key}
            onClick={t.onClick}
            disabled={t.disabled}
            title={t.title}
            className={cn(
              "flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[7px] border border-[var(--border)] bg-[var(--card)] px-[11px] py-1.5 text-[11.5px] font-semibold text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50",
              t.active && "border-transparent bg-[var(--primary-dim)] text-[var(--primary)] hover:text-[var(--primary)]"
            )}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
        <button
          onClick={() => setMinimapVisible((v) => !v)}
          className={cn(
            "flex-shrink-0 whitespace-nowrap rounded-[7px] border border-[var(--border)] bg-[var(--card)] px-[11px] py-1.5 text-[11.5px] font-semibold text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]",
            minimapVisible && "border-transparent bg-[var(--primary-dim)] text-[var(--primary)]"
          )}
        >
          Minimap
        </button>
        <button
          onClick={() => setSnapOn((v) => !v)}
          className={cn(
            "flex-shrink-0 whitespace-nowrap rounded-[7px] border border-[var(--border)] bg-[var(--card)] px-[11px] py-1.5 text-[11.5px] font-semibold text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--text)]",
            snapOn && "border-transparent bg-[var(--primary-dim)] text-[var(--primary)]"
          )}
        >
          ⌗ Snap
        </button>
      </div>
    </div>
  );
}
