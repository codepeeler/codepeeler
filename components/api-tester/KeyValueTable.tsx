"use client";

import { useState } from "react";
import { Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { newRow } from "@/lib/api-tester/engine";
import type { KVRow } from "@/lib/api-tester/types";

function Checkbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex h-[14px] w-[14px] flex-shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-[var(--border)] bg-[var(--bg-elev)]",
        checked && "border-[var(--primary)] bg-[var(--primary)] text-white"
      )}
    >
      {checked && <Check size={10} strokeWidth={3} />}
    </button>
  );
}

interface KeyValueTableProps {
  rows: KVRow[];
  onChange: (rows: KVRow[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  showDesc?: boolean;
  suggestions?: string[];
}

export default function KeyValueTable({
  rows,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  showDesc = true,
  suggestions,
}: KeyValueTableProps) {
  const [focusSuggest, setFocusSuggest] = useState<number | null>(null);

  const update = (idx: number, patch: Partial<KVRow>) => {
    const copy = rows.slice();
    copy[idx] = { ...copy[idx], ...patch };
    if (idx === rows.length - 1 && (patch.key || patch.value)) copy.push(newRow());
    onChange(copy);
  };
  const remove = (idx: number) => {
    const copy = rows.filter((_, i) => i !== idx);
    onChange(copy.length ? copy : [newRow()]);
  };

  const gridCols = showDesc ? "26px 1fr 1fr 1fr 30px" : "26px 1fr 1fr 30px";

  return (
    <div>
      <div className="grid gap-1.5 px-2 pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--text-faint)]" style={{ gridTemplateColumns: gridCols }}>
        <span />
        <span>{keyPlaceholder}</span>
        <span>{valuePlaceholder}</span>
        {showDesc && <span>Description</span>}
        <span />
      </div>
      {rows.map((row, idx) => {
        const isLast = idx === rows.length - 1;
        return (
          <div key={row.id} className="grid items-center gap-1.5 rounded-[7px] px-2 py-[3px] hover:bg-[var(--card-hover)]" style={{ gridTemplateColumns: gridCols }}>
            <Checkbox checked={row.enabled} onChange={(v) => update(idx, { enabled: v })} />
            <div className="relative">
              <input
                className="w-full rounded-md px-1.5 py-[5px] font-[family-name:var(--font-mono)] text-[12.5px] focus:bg-[var(--bg-elev)] focus:shadow-[inset_0_0_0_1px_var(--primary)]"
                placeholder={isLast ? keyPlaceholder : ""}
                value={row.key}
                onFocus={() => suggestions && setFocusSuggest(idx)}
                onBlur={() => setTimeout(() => setFocusSuggest(null), 120)}
                onChange={(e) => update(idx, { key: e.target.value })}
              />
              {suggestions && focusSuggest === idx && row.key && (
                <div className="absolute left-0 top-full z-50 max-h-40 min-w-[160px] overflow-y-auto rounded-lg border border-[var(--border-soft)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
                  {suggestions
                    .filter((s) => s.toLowerCase().includes(row.key.toLowerCase()) && s.toLowerCase() !== row.key.toLowerCase())
                    .slice(0, 6)
                    .map((s) => (
                      <div
                        key={s}
                        className="cursor-pointer px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-xs hover:bg-[var(--card-hover)]"
                        onMouseDown={() => update(idx, { key: s })}
                      >
                        {s}
                      </div>
                    ))}
                </div>
              )}
            </div>
            <input
              className="w-full rounded-md px-1.5 py-[5px] font-[family-name:var(--font-mono)] text-[12.5px] focus:bg-[var(--bg-elev)] focus:shadow-[inset_0_0_0_1px_var(--primary)]"
              placeholder={isLast ? valuePlaceholder : ""}
              value={row.value}
              onChange={(e) => update(idx, { value: e.target.value })}
            />
            {showDesc && (
              <input
                className="w-full rounded-md px-1.5 py-[5px] text-[12.5px] focus:bg-[var(--bg-elev)] focus:shadow-[inset_0_0_0_1px_var(--primary)]"
                placeholder={isLast ? "Description" : ""}
                value={row.desc || ""}
                onChange={(e) => update(idx, { desc: e.target.value })}
              />
            )}
            <button
              className="flex h-[26px] w-[26px] items-center justify-center rounded-lg text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--danger)] disabled:opacity-25"
              disabled={isLast && !row.key}
              onClick={() => remove(idx)}
              title="Remove row"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
