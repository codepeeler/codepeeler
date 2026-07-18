"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import { PanelToolbar, PanelBody } from "@/components/tools/PanelParts";
import { NumberField, SelectField } from "@/components/tools/FormFields";
import { PrimaryButton } from "@/components/tools/Buttons";
import CopyButton from "@/components/tools/CopyButton";

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

type Format = "hex" | "rgb" | "hsl";

function randomColorGenerate(format: Format, count: number): { value: string; hex: string }[] {
  const n = Math.max(1, Math.min(Math.round(count), 100));
  const arr = new Uint8Array(n * 3);
  crypto.getRandomValues(arr);
  const out: { value: string; hex: string }[] = [];
  for (let i = 0; i < n; i++) {
    const r = arr[i * 3],
      g = arr[i * 3 + 1],
      b = arr[i * 3 + 2];
    const hex = rgbToHex(r, g, b);
    if (format === "rgb") out.push({ value: `rgb(${r}, ${g}, ${b})`, hex });
    else if (format === "hsl") out.push({ value: rgbToHsl(r, g, b), hex });
    else out.push({ value: hex, hex });
  }
  return out;
}

export default function RandomColorGeneratorPage() {
  const [format, setFormat] = useState<Format>("hex");
  const [count, setCount] = useState(8);
  const [colors, setColors] = useState<{ value: string; hex: string }[]>([]);

  const regenerate = () => setColors(randomColorGenerate(format, count));

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, count]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="image"
        badge="🎨"
        title="Random Color Generator"
        desc="Generate random colors in HEX, RGB, or HSL format using the browser's secure random generator."
      />

      <ToolPanel>
        <PanelToolbar>
          <div className="flex flex-wrap items-center gap-4">
            <SelectField
              label="Format"
              value={format}
              onChange={(v) => setFormat(v as Format)}
              options={[
                { value: "hex", label: "HEX" },
                { value: "rgb", label: "RGB" },
                { value: "hsl", label: "HSL" },
              ]}
            />
            <NumberField label="Count" min={1} max={100} value={count} onChange={setCount} />
          </div>
          <div className="flex items-center gap-2">
            <CopyButton value={colors.map((c) => c.value).join("\n")} />
            <PrimaryButton onClick={regenerate}>
              <RefreshCw size={13} /> Generate
            </PrimaryButton>
          </div>
        </PanelToolbar>

        <PanelBody>
          <div className="grid max-h-[420px] grid-cols-2 gap-1.5 overflow-auto sm:grid-cols-3 lg:grid-cols-4">
            {colors.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-[var(--border)]"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="truncate font-[family-name:var(--font-mono)] text-[12.5px] text-[var(--text)]">{c.value}</span>
                </div>
                <CopyButton value={c.value} />
              </div>
            ))}
          </div>
        </PanelBody>
      </ToolPanel>
    </div>
  );
}
