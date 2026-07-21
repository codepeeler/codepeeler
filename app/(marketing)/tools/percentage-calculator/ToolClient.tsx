"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type PctMode = "of" | "is-what-percent" | "change";

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function percentageCalc(input: string, mode: PctMode): string {
  const parts = input
    .split(/[,\n]/)
    .map((p) => parseFloat(p.trim()))
    .filter((n) => !isNaN(n));
  if (parts.length < 2) throw new Error("Enter two numbers separated by a comma, e.g. 25, 200");
  const [a, b] = parts;
  if (mode === "of") {
    return `${a}% of ${b} = ${round4((a / 100) * b)}`;
  } else if (mode === "is-what-percent") {
    if (b === 0) throw new Error("Second number can't be zero");
    return `${a} is ${round4((a / b) * 100)}% of ${b}`;
  } else {
    if (a === 0) throw new Error("First number can't be zero (used as the base)");
    const change = ((b - a) / a) * 100;
    const dir = change >= 0 ? "increase" : "decrease";
    return `${round4(Math.abs(change))}% ${dir} (from ${a} to ${b})`;
  }
}

const MODE_HINTS: Record<PctMode, string> = {
  of: "e.g. 25, 200  →  25% of 200",
  "is-what-percent": "e.g. 50, 200  →  50 is what % of 200",
  change: "e.g. 80, 100  →  % change from 80 to 100",
};

export default function PercentageCalculatorPage() {
  const [mode, setMode] = useState<PctMode>("of");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="%"
        title="Percentage Calculator"
        desc="Percent-of, what-percent-is-X-of-Y, and percent change — all in one place."
      />
      <ToolLab
        inputLabel="Numbers"
        outputLabel="Result"
        placeholder={MODE_HINTS[mode]}
        modes={[
          { value: "of", label: "X% of Y" },
          { value: "is-what-percent", label: "X is what % of Y" },
          { value: "change", label: "% Change" },
        ]}
        mode={mode}
        onModeChange={(m) => setMode(m as PctMode)}
        live
        recalcKey={mode}
        monospaceInput={false}
        emptyHint="Enter two numbers separated by a comma above — the result updates automatically."
        onRun={(input) => percentageCalc(input, mode)}
      />
    </div>
  );
}
