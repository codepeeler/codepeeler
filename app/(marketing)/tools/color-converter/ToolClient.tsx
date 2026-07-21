"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type ColorFormat = "hex" | "rgb" | "hsl";

function parseColorToRgb(input: string): { r: number; g: number; b: number } {
  const s = input.trim();

  const hexMatch = s.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  const rgbMatch = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (rgbMatch) {
    return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) };
  }

  const hslMatch = s.match(/^hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (hslMatch) {
    const h = Number(hslMatch[1]) / 360;
    const sat = Number(hslMatch[2]) / 100;
    const l = Number(hslMatch[3]) / 100;
    if (sat === 0) {
      const v = Math.round(l * 255);
      return { r: v, g: v, b: v };
    }
    const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
    const p = 2 * l - q;
    const hueToRgb = (t: number) => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };
    return {
      r: Math.round(hueToRgb(h + 1 / 3) * 255),
      g: Math.round(hueToRgb(h) * 255),
      b: Math.round(hueToRgb(h - 1 / 3) * 255),
    };
  }

  throw new Error("Enter a color as HEX (#fff), RGB (rgb(255,255,255)), or HSL (hsl(0,0%,100%))");
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): string {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function colorConvert(input: string, target: ColorFormat): string {
  const { r, g, b } = parseColorToRgb(input);
  if (target === "hex") return rgbToHex(r, g, b);
  if (target === "rgb") return `rgb(${r}, ${g}, ${b})`;
  return rgbToHsl(r, g, b);
}

export default function ColorConverterPage() {
  const [target, setTarget] = useState<ColorFormat>("hex");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="image"
        badge="◐"
        title="Color Format Converter"
        desc="Convert any color between HEX, RGB, and HSL — paste in any supported format."
      />
      <ToolLab
        inputLabel="Color (HEX, RGB, or HSL)"
        outputLabel={target.toUpperCase()}
        placeholder="e.g. #3b82f6, rgb(59,130,246), or hsl(217,91%,60%)"
        modes={[
          { value: "hex", label: "→ HEX" },
          { value: "rgb", label: "→ RGB" },
          { value: "hsl", label: "→ HSL" },
        ]}
        mode={target}
        onModeChange={(m) => setTarget(m as ColorFormat)}
        live
        recalcKey={target}
        emptyHint="Enter a color above — the converted value updates automatically."
        onRun={(input) => colorConvert(input, target)}
      />
    </div>
  );
}
