"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import ToolHeader from "@/components/tools/ToolHeader";
import CopyButton from "@/components/tools/CopyButton";
import { useToast } from "@/providers/toast-provider";

export default function UuidGeneratorPage() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 5 }, () => crypto.randomUUID()));
  const { toast } = useToast();

  const format = (id: string) => {
    let out = hyphens ? id : id.replace(/-/g, "");
    return uppercase ? out.toUpperCase() : out;
  };

  const regenerate = (n = count) => {
    setUuids(Array.from({ length: n }, () => crypto.randomUUID()));
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(uuids.map(format).join("\n"));
      toast(`Copied ${uuids.length} UUIDs`);
    } catch {
      toast("Couldn't copy — try selecting manually");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="id"
        title="UUID Generator"
        desc="Generate random version 4 UUIDs using the browser's cryptographically secure random generator."
      />

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-elev)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-soft)] p-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
              Count
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => {
                  const n = Math.max(1, Math.min(100, Number(e.target.value) || 1));
                  setCount(n);
                  regenerate(n);
                }}
                className="w-16 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12.5px] text-[var(--text)]"
              />
            </label>
            <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="h-3.5 w-3.5 accent-[var(--primary)]"
              />
              Uppercase
            </label>
            <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
              <input
                type="checkbox"
                checked={hyphens}
                onChange={(e) => setHyphens(e.target.checked)}
                className="h-3.5 w-3.5 accent-[var(--primary)]"
              />
              Hyphens
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyAll}
              className="rounded-[7px] border border-[var(--border)] bg-[var(--card)] px-3 py-[7px] text-[12.5px] font-semibold text-[var(--text-dim)] transition-colors duration-150 hover:border-[var(--text-faint)] hover:text-[var(--text)]"
            >
              Copy all
            </button>
            <button
              onClick={() => regenerate()}
              className="flex items-center gap-1.5 rounded-[7px] bg-[var(--primary)] px-3.5 py-[7px] text-[12.5px] font-semibold text-white transition-all duration-150 hover:brightness-[1.08]"
            >
              <RefreshCw size={13} /> Generate
            </button>
          </div>
        </div>

        <div className="max-h-[420px] space-y-1.5 overflow-auto p-4">
          {uuids.map((id, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5"
            >
              <span className="font-[family-name:var(--font-mono)] text-[13px] text-[var(--text)]">
                {format(id)}
              </span>
              <CopyButton value={format(id)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
