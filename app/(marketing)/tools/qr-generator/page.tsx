"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import ToolHeader from "@/components/tools/ToolHeader";

const SIZES = [128, 192, 256, 320, 400];
const EC_LEVELS = [
  { value: "L", label: "L — Low (7%)" },
  { value: "M", label: "M — Medium (15%)" },
  { value: "Q", label: "Q — Quartile (25%)" },
  { value: "H", label: "H — High (30%)" },
] as const;

export default function QrGeneratorPage() {
  const [text, setText] = useState("");
  const [size, setSize] = useState(256);
  const [ecLevel, setEcLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (!text.trim() || !canvasRef.current) {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      setError(null);
      return;
    }
    // Loaded dynamically so the rest of the site doesn't pay for this dependency.
    // Requires: npm install qrcode
    import("qrcode")
      .then((QRCode) => {
        if (cancelled || !canvasRef.current) return;
        QRCode.toCanvas(
          canvasRef.current,
          text,
          { width: size, margin: 1, errorCorrectionLevel: ecLevel },
          (err: Error | null | undefined) => {
            if (cancelled) return;
            setError(err ? err.message : null);
          }
        );
      })
      .catch(() => {
        if (!cancelled) setError('Missing dependency — run "npm install qrcode" in the project.');
      });
    return () => {
      cancelled = true;
    };
  }, [text, size, ecLevel]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) return;
    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="▦"
        title="QR Code Generator"
        desc="Turn any text, URL, or string into a scannable QR code — generated locally, nothing is sent to a server."
      />

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-elev)]">
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)]">
              <div className="border-b border-[var(--border-soft)] px-3 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-faint)]">
                  Text or URL
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                placeholder="https://example.com"
                className="h-[140px] w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)] placeholder:text-[var(--text-faint)]"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
                Size
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12.5px] text-[var(--text)]"
                >
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}px
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]">
                Error correction
                <select
                  value={ecLevel}
                  onChange={(e) => setEcLevel(e.target.value as typeof ecLevel)}
                  className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12.5px] text-[var(--text)]"
                >
                  {EC_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-6">
            <canvas ref={canvasRef} className="rounded-[8px] bg-white" />
            {!text.trim() && (
              <p className="text-center text-[12px] text-[var(--text-faint)]">
                Your QR code preview will appear here.
              </p>
            )}
            <button
              onClick={download}
              disabled={!text.trim()}
              className="flex w-full items-center justify-center gap-1.5 rounded-[7px] bg-[var(--primary)] px-3.5 py-2 text-[12.5px] font-semibold text-white transition-all duration-150 hover:brightness-[1.08] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download size={13} /> Download PNG
            </button>
          </div>
        </div>

        <div
          className={`border-t border-[var(--border-soft)] px-4 py-2.5 text-[12px] ${
            error ? "text-[var(--danger)]" : "text-[var(--text-faint)]"
          }`}
        >
          {error ?? "Enter text above — the QR code updates automatically."}
        </div>
      </div>
    </div>
  );
}
