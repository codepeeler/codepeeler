"use client";

import { useEffect, useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import { PanelToolbar, PanelBody } from "@/components/tools/PanelParts";
import { TextField, SelectField } from "@/components/tools/FormFields";
import CopyButton from "@/components/tools/CopyButton";

type Scheme = "complementary" | "analogous" | "triadic" | "tetradic";

function parseHexColor(hex: string): { r: number; g: number; b: number } {
  const clean = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean) && !/^[0-9a-fA-F]{3}$/.test(clean)) throw new Error("Enter a valid hex color, e.g. #3b82f6");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
}

function rgbToHslTuple(r: number, g: number, b: number): [number, number, number] {
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
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generatePalette(input: string, scheme: Scheme): string[] {
  const { r, g, b } = parseHexColor(input);
  const [h, s, l] = rgbToHslTuple(r, g, b);
  let hues: number[];
  if (scheme === "complementary") hues = [h, h + 180];
  else if (scheme === "analogous") hues = [h - 30, h, h + 30];
  else if (scheme === "triadic") hues = [h, h + 120, h + 240];
  else hues = [h, h + 90, h + 180, h + 270];
  return hues.map((hue) => hslToHex(hue, s, l));
}

export default function ColorPaletteGeneratorPage() {
  const [base, setBase] = useState("#3b82f6");
  const [scheme, setScheme] = useState<Scheme>("complementary");
  const [palette, setPalette] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setPalette(generatePalette(base, scheme));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPalette([]);
    }
  }, [base, scheme]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="image"
        badge="🎨"
        title="Color Palette Generator"
        desc="Enter a base color to generate a complementary, analogous, triadic, or tetradic palette."
      />

      <ToolPanel>
        <PanelToolbar>
          <div className="flex flex-wrap items-center gap-4">
            <TextField label="Base color" value={base} onChange={setBase} width="w-28" />
            <SelectField
              label="Scheme"
              value={scheme}
              onChange={(v) => setScheme(v as Scheme)}
              options={[
                { value: "complementary", label: "Complementary" },
                { value: "analogous", label: "Analogous" },
                { value: "triadic", label: "Triadic" },
                { value: "tetradic", label: "Tetradic" },
              ]}
            />
          </div>
        </PanelToolbar>

        <PanelBody>
          {error ? (
            <p className="text-[13px] text-[var(--danger)]">{error}</p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
              {palette.map((hex, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-4 w-4 shrink-0 rounded-full border border-[var(--border)]" style={{ backgroundColor: hex }} />
                    <span className="truncate font-[family-name:var(--font-mono)] text-[12.5px] text-[var(--text)]">{hex}</span>
                  </div>
                  <CopyButton value={hex} />
                </div>
              ))}
            </div>
          )}
        </PanelBody>
      </ToolPanel>
    </div>
  );
}
