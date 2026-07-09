"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type CssUnitFrom = "px" | "rem" | "em" | "pt";

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function cssUnitConvert(input: string, from: CssUnitFrom, rootPx: number): string {
  const value = parseFloat(input.trim());
  if (isNaN(value)) throw new Error("Enter a number (e.g. 16)");

  const px = from === "px" ? value : from === "pt" ? value * (96 / 72) : value * rootPx;

  const rem = px / rootPx;
  const em = px / rootPx;
  const pt = px * (72 / 96);

  return [`px:  ${round(px)}px`, `rem: ${round(rem)}rem`, `em:  ${round(em)}em`, `pt:  ${round(pt)}pt`].join("\n");
}

export default function CssUnitConverterPage() {
  const [from, setFrom] = useState<CssUnitFrom>("px");
  const [rootPx, setRootPx] = useState(16);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="px"
        title="CSS Unit Converter"
        desc="Convert between px, rem, em, and pt — using your chosen root font size for rem/em conversions."
      />
      <ToolLab
        inputLabel={`Value (${from})`}
        outputLabel="Converted"
        placeholder="e.g. 16"
        modes={[
          { value: "px", label: "px" },
          { value: "rem", label: "rem" },
          { value: "em", label: "em" },
          { value: "pt", label: "pt" },
        ]}
        mode={from}
        onModeChange={(m) => setFrom(m as CssUnitFrom)}
        live
        recalcKey={`${from}-${rootPx}`}
        emptyHint="Enter a number above — all unit equivalents update automatically."
        settingsSlot={
          <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
            Root font size
            <input
              type="number"
              min={1}
              value={rootPx}
              onChange={(e) => setRootPx(Math.max(1, Number(e.target.value) || 16))}
              className="w-16 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12.5px] text-[var(--text)]"
            />
            px
          </label>
        }
        onRun={(input) => cssUnitConvert(input, from, rootPx)}
      />
    </div>
  );
}
