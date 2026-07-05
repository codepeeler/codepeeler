"use client";

import { Trash2 } from "lucide-react";
import { useWorkflow } from "@/providers/workflow-provider";
import { NODE_TYPES, NODE_CAT_COLOR } from "@/lib/data/node-types";
import type { HashAlgo } from "@/lib/transforms";

const HASH_ALGOS: HashAlgo[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

export default function Inspector() {
  const { nodes, selectedIds, deleteSelected, conns, updateNodeSettings, inspectorWidth, setInspectorWidth } =
    useWorkflow();
  const node = selectedIds.length === 1 ? nodes.find((n) => n.id === selectedIds[0]) : undefined;

  const onResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = inspectorWidth;
    const onMove = (ev: PointerEvent) => setInspectorWidth(startWidth - (ev.clientX - startX));
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <aside
      style={{ width: inspectorWidth }}
      className="relative z-30 flex flex-shrink-0 flex-col border-l border-[var(--border-soft)] bg-[var(--bg-elev)]"
    >
      <div
        onPointerDown={onResizeStart}
        className="absolute left-[-3px] top-0 z-[35] h-full w-1.5 cursor-col-resize hover:bg-[var(--primary)]"
      />

      {selectedIds.length === 0 ? (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-0.5 font-[family-name:var(--font-display)] text-[14.5px] font-semibold">
            No node selected
          </div>
          <p className="text-[11px] leading-[1.55] text-[var(--text-faint)]">
            Select a node on the canvas to view and edit its settings here. Shift-click or
            drag on empty canvas to select more than one.
          </p>
        </div>
      ) : selectedIds.length > 1 ? (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-0.5 font-[family-name:var(--font-display)] text-[14.5px] font-semibold">
            {selectedIds.length} nodes selected
          </div>
          <p className="mb-4 text-[11px] leading-[1.55] text-[var(--text-faint)]">
            Drag any of the selected nodes to move the whole group together.
          </p>
          <button
            onClick={deleteSelected}
            className="flex w-full items-center justify-center gap-1.5 rounded-[9px] border border-[var(--danger)]/30 bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] px-3 py-2 text-[12px] font-semibold text-[var(--danger)] transition-colors duration-150 hover:bg-[var(--danger)] hover:text-white"
          >
            <Trash2 size={13} /> Delete {selectedIds.length} nodes
          </button>
        </div>
      ) : node ? (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span
              style={{
                color: NODE_CAT_COLOR[NODE_TYPES[node.type].cat],
                background: `color-mix(in srgb, ${NODE_CAT_COLOR[NODE_TYPES[node.type].cat]} 14%, transparent)`,
              }}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] font-[family-name:var(--font-mono)] text-[11px] font-bold"
            >
              {NODE_TYPES[node.type].badge}
            </span>
            <div className="min-w-0">
              <div className="truncate font-[family-name:var(--font-display)] text-[14.5px] font-semibold">
                {NODE_TYPES[node.type].label}
              </div>
              <div className="text-[10.5px] text-[var(--text-faint)]">{NODE_TYPES[node.type].desc}</div>
            </div>
          </div>

          <div className="mb-4 rounded-lg border border-[var(--border-soft)] p-3 text-[11.5px] text-[var(--text-dim)]">
            <div className="flex items-center justify-between py-1">
              <span>Node ID</span>
              <span className="font-[family-name:var(--font-mono)] text-[10.5px] text-[var(--text-faint)]">
                {node.id}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Status</span>
              <span className="capitalize">{node.status}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Connections</span>
              <span>{conns.filter((c) => c.from === node.id || c.to === node.id).length}</span>
            </div>
          </div>

          {node.type === "hash" && (
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-semibold text-[var(--text-dim)]">
                Algorithm
              </label>
              <select
                value={node.settings?.algo ?? "SHA-256"}
                onChange={(e) => updateNodeSettings(node.id, { algo: e.target.value as HashAlgo })}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 text-[12px] text-[var(--text)]"
              >
                {HASH_ALGOS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          )}

          {node.type === "json-format" && (
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-semibold text-[var(--text-dim)]">
                Indent
              </label>
              <select
                value={node.settings?.indent ?? 2}
                onChange={(e) => updateNodeSettings(node.id, { indent: Number(e.target.value) })}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 text-[12px] text-[var(--text)]"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
              </select>
            </div>
          )}

          {node.type === "password-gen" && (
            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-[var(--text-dim)]">
                  Length
                  <span className="font-[family-name:var(--font-mono)] text-[var(--text)]">
                    {node.settings?.length ?? 16}
                  </span>
                </label>
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={node.settings?.length ?? 16}
                  onChange={(e) => updateNodeSettings(node.id, { length: Number(e.target.value) })}
                  className="w-full accent-[var(--primary)]"
                />
              </div>
              {(["upper", "lower", "digits", "symbols"] as const).map((key) => (
                <label key={key} className="flex items-center justify-between text-[11.5px] text-[var(--text-dim)]">
                  <span className="capitalize">{key}</span>
                  <input
                    type="checkbox"
                    checked={node.settings?.[key] !== false}
                    onChange={(e) => updateNodeSettings(node.id, { [key]: e.target.checked })}
                    className="accent-[var(--primary)]"
                  />
                </label>
              ))}
            </div>
          )}

          {node.output !== undefined && (
            <div className="mb-4">
              <div className="mb-1.5 text-[11px] font-semibold text-[var(--text-dim)]">
                {node.status === "err" ? "Error" : "Output"}
              </div>
              <pre
                className={`max-h-[160px] overflow-auto whitespace-pre-wrap break-words rounded-lg border p-2.5 font-[family-name:var(--font-mono)] text-[10.5px] leading-[1.5] ${
                  node.status === "err"
                    ? "border-[var(--danger)]/30 bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] text-[var(--danger)]"
                    : "border-[var(--border-soft)] bg-[var(--bg)] text-[var(--text-dim)]"
                }`}
              >
                {node.output}
              </pre>
            </div>
          )}

          <button
            onClick={deleteSelected}
            className="flex w-full items-center justify-center gap-1.5 rounded-[9px] border border-[var(--danger)]/30 bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] px-3 py-2 text-[12px] font-semibold text-[var(--danger)] transition-colors duration-150 hover:bg-[var(--danger)] hover:text-white"
          >
            <Trash2 size={13} /> Delete node
          </button>
        </div>
      ) : null}
    </aside>
  );
}
