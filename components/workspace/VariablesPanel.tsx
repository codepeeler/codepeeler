"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useWorkflow } from "@/providers/workflow-provider";

export default function VariablesPanel() {
  const { variables, addVariable, updateVariable, deleteVariable, variablesPanelOpen, setVariablesPanelOpen } =
    useWorkflow();

  if (!variablesPanelOpen) return null;

  return (
    <div className="absolute right-3.5 top-3.5 z-[60] flex w-[320px] max-w-[calc(100%-28px)] flex-col rounded-[12px] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 border-b border-[var(--border-soft)] px-3.5 py-3">
        <div className="flex-1">
          <div className="font-[family-name:var(--font-display)] text-[13px] font-semibold">Variables</div>
          <div className="text-[10.5px] text-[var(--text-faint)]">
            Reference with <code className="font-[family-name:var(--font-mono)]">{"{{name}}"}</code> inside an Input
            node
          </div>
        </div>
        <button
          onClick={() => setVariablesPanelOpen(false)}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
        >
          <X size={13} />
        </button>
      </div>

      <div className="max-h-[280px] overflow-y-auto p-2.5">
        {variables.length === 0 ? (
          <div className="px-1.5 py-4 text-center text-[11px] leading-[1.6] text-[var(--text-faint)]">
            No variables yet. Add one to reuse a value — like an API key or base
            URL — across nodes in this workflow.
          </div>
        ) : (
          <div className="space-y-2">
            {variables.map((v) => (
              <div key={v.id} className="flex items-center gap-1.5 rounded-[9px] border border-[var(--border-soft)] p-1.5">
                <input
                  value={v.name}
                  onChange={(e) => updateVariable(v.id, { name: e.target.value.replace(/\s+/g, "_") })}
                  placeholder="name"
                  className="w-[92px] flex-shrink-0 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-[11px] text-[var(--text)]"
                />
                <input
                  value={v.value}
                  onChange={(e) => updateVariable(v.id, { value: e.target.value })}
                  placeholder="value"
                  className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-1.5 text-[11px] text-[var(--text)]"
                />
                <button
                  onClick={() => deleteVariable(v.id)}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[var(--text-faint)] transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] hover:text-[var(--danger)]"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border-soft)] p-2.5">
        <button
          onClick={() => addVariable()}
          className="flex w-full items-center justify-center gap-1.5 rounded-[9px] border border-dashed border-[var(--border)] bg-[var(--bg-elev)] px-3 py-2 text-[12px] font-semibold text-[var(--text-dim)] transition-colors duration-150 hover:border-[var(--primary)] hover:text-[var(--primary)]"
        >
          <Plus size={13} /> Add variable
        </button>
      </div>
    </div>
  );
}
