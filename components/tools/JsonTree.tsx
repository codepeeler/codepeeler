"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function typeOf(v: JsonValue): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function ValueLabel({ value }: { value: JsonValue }) {
  const t = typeOf(value);
  if (t === "string") return <span className="text-[var(--cat-encode)]">&quot;{value as string}&quot;</span>;
  if (t === "number") return <span className="text-[var(--cat-gen)]">{String(value)}</span>;
  if (t === "boolean") return <span className="text-[var(--cat-sec)]">{String(value)}</span>;
  if (t === "null") return <span className="text-[var(--text-faint)]">null</span>;
  return null;
}

function TreeNode({
  label,
  value,
  depth,
  defaultOpen,
}: {
  label: string | null;
  value: JsonValue;
  depth: number;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const t = typeOf(value);
  const isContainer = t === "object" || t === "array";

  if (!isContainer) {
    return (
      <div className="flex items-start gap-1 py-[1px] pl-4 font-[family-name:var(--font-mono)] text-[13px]">
        {label !== null && <span className="text-[var(--text-dim)]">{label}: </span>}
        <ValueLabel value={value} />
      </div>
    );
  }

  const entries = t === "array" ? (value as JsonValue[]).map((v, i) => [String(i), v] as const) : Object.entries(value as Record<string, JsonValue>);
  const count = entries.length;
  const bracket = t === "array" ? ["[", "]"] : ["{", "}"];

  return (
    <div className="font-[family-name:var(--font-mono)] text-[13px]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1 py-[1px] pl-2 text-left hover:bg-[var(--card-hover)]"
      >
        {open ? <ChevronDown size={12} className="flex-shrink-0 text-[var(--text-faint)]" /> : <ChevronRight size={12} className="flex-shrink-0 text-[var(--text-faint)]" />}
        {label !== null && <span className="text-[var(--text-dim)]">{label}: </span>}
        <span className="text-[var(--text-faint)]">
          {bracket[0]}
          {!open && `${count} ${t === "array" ? "items" : "keys"}`}
          {!open && bracket[1]}
        </span>
      </button>
      {open && (
        <div className="ml-3 border-l border-[var(--border-soft)] pl-2">
          {entries.map(([k, v]) => (
            <TreeNode key={k} label={t === "array" ? null : k} value={v} depth={depth + 1} defaultOpen={depth < 1} />
          ))}
          <div className="pl-4 text-[var(--text-faint)]">{bracket[1]}</div>
        </div>
      )}
    </div>
  );
}

export default function JsonTree({ data }: { data: JsonValue }) {
  return <TreeNode label={null} value={data} depth={0} defaultOpen />;
}
