"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { NumberField } from "@/components/tools/FormFields";

function fluidTypeCalc(minSizeStr: string, maxSize: number, minVw: number, maxVw: number): string {
  const minSize = Number(minSizeStr.trim());
  if (isNaN(minSize)) throw new Error("Enter the minimum font size in px");
  if (minVw >= maxVw) throw new Error("Max viewport must be greater than min viewport");
  const slope = (maxSize - minSize) / (maxVw - minVw);
  const yIntersect = -minVw * slope + minSize;
  const slopeVw = (slope * 100).toFixed(4);
  const remMin = (minSize / 16).toFixed(4);
  const remMax = (maxSize / 16).toFixed(4);
  const remIntersect = (yIntersect / 16).toFixed(4);
  return `font-size: clamp(${remMin}rem, calc(${remIntersect}rem + ${slopeVw}vw), ${remMax}rem);\n\n/* min: ${minSize}px at ${minVw}px viewport */\n/* max: ${maxSize}px at ${maxVw}px viewport */`;
}

export default function CssFluidTypeCalculatorPage() {
  const [maxSize, setMaxSize] = useState(32);
  const [minVw, setMinVw] = useState(320);
  const [maxVw, setMaxVw] = useState(1440);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="clmp"
        title="CSS Fluid Type Calculator"
        desc="Enter a min font size and viewport range to generate a responsive clamp() font-size rule."
      />
      <ToolLab
        inputLabel="Min font size (px)"
        outputLabel="CSS"
        placeholder="16"
        live
        recalcKey={`${maxSize}-${minVw}-${maxVw}`}
        settingsSlot={
          <>
            <NumberField label="Max size (px)" value={maxSize} onChange={setMaxSize} />
            <NumberField label="Min viewport (px)" value={minVw} onChange={setMinVw} />
            <NumberField label="Max viewport (px)" value={maxVw} onChange={setMaxVw} />
          </>
        }
        emptyHint="Enter the minimum font size above — the clamp() rule updates automatically."
        onRun={(input) => fluidTypeCalc(input, maxSize, minVw, maxVw)}
      />
    </div>
  );
}
