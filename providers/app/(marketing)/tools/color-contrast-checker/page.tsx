"use client";

import { useMemo, useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import { PanelBody, PanelFooter } from "@/components/tools/PanelParts";

function parseColorToRgb(input: string): { r: number; g: number; b: number } | null {
  const s = input.trim();
  const hexMatch = s.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  const rgbMatch = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (rgbMatch) return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) };
  return null;
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function toHex(rgb: { r: number; g: number; b: number }): string {
  return "#" + [rgb.r, rgb.g, rgb.b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export default function ColorContrastCheckerPage() {
  const [fg, setFg] = useState("#111827");
  const [bg, setBg] = useState("#ffffff");

  const fgRgb = useMemo(() => parseColorToRgb(fg), [fg]);
  const bgRgb = useMemo(() => parseColorToRgb(bg), [bg]);

  const result = useMemo(() => {
    if (!fgRgb || !bgRgb) return null;
    const ratio = contrastRatio(fgRgb, bgRgb);
    return {
      ratio,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    };
  }, [fgRgb, bgRgb]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="image"
        badge="◐◑"
        title="Color Contrast Checker"
        desc="Check the WCAG contrast ratio between a foreground and background color — for accessible text and UI."
      />

      <ToolPanel>
        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <FieldBox
            label="Foreground (text)"
            right={
              <input
                type="color"
                value={fgRgb ? toHex(fgRgb) : "#111827"}
                onChange={(e) => setFg(e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-[var(--border)] bg-transparent"
              />
            }
          >
            <input
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              spellCheck={false}
              placeholder="#111827 or rgb(17,24,39)"
              className="w-full bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>

          <FieldBox
            label="Background"
            right={
              <input
                type="color"
                value={bgRgb ? toHex(bgRgb) : "#ffffff"}
                onChange={(e) => setBg(e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-[var(--border)] bg-transparent"
              />
            }
          >
            <input
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              spellCheck={false}
              placeholder="#ffffff or rgb(255,255,255)"
              className="w-full bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>
        </PanelBody>

        <PanelBody className="pt-0">
          <div
            style={{ color: fgRgb ? toHex(fgRgb) : "#111827", background: bgRgb ? toHex(bgRgb) : "#ffffff" }}
            className="mb-4 flex flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--border)] p-5"
          >
            <span className="text-[22px] font-semibold leading-tight">Large text preview Aa</span>
            <span className="text-[14px] leading-snug">
              Normal-size body text preview — the quick brown fox jumps over the lazy dog.
            </span>
          </div>

          {result ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-3 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-faint)]">Ratio</div>
                <div className="mt-1 font-[family-name:var(--font-mono)] text-[18px] font-semibold">
                  {result.ratio.toFixed(2)}:1
                </div>
              </div>
              {(
                [
                  ["AA Normal", result.aaNormal],
                  ["AA Large", result.aaLarge],
                  ["AAA Normal", result.aaaNormal],
                  ["AAA Large", result.aaaLarge],
                ] as const
              ).map(([label, pass]) => (
                <div key={label} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-3 text-center">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-faint)]">{label}</div>
                  <div className={`mt-1 text-[14px] font-semibold ${pass ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                    {pass ? "Pass" : "Fail"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[var(--text-faint)]">
              Enter both colors as HEX (#rrggbb) or RGB (rgb(r,g,b)) to see the contrast ratio.
            </p>
          )}
        </PanelBody>

        <PanelFooter>
          WCAG 2.1: AA requires 4.5:1 for normal text (3:1 for large text ≥18pt/14pt bold). AAA requires 7:1 (4.5:1 for
          large text).
        </PanelFooter>
      </ToolPanel>
    </div>
  );
}
