"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import { PanelBody, PanelFooter } from "@/components/tools/PanelParts";
import { SelectField } from "@/components/tools/FormFields";
import { PrimaryButton } from "@/components/tools/Buttons";

const SIZES = [128, 192, 256, 320, 400];
const EC_LEVELS = [
  { value: "L", label: "L — Low (7%)" },
  { value: "M", label: "M — Medium (15%)" },
  { value: "Q", label: "Q — Quartile (25%)" },
  { value: "H", label: "H — High (30%)" },
];

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

      <ToolPanel>
        <PanelBody className="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            <FieldBox label="Text or URL" height="140px">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                placeholder="https://example.com"
                className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)] placeholder:text-[var(--text-faint)]"
              />
            </FieldBox>

            <div className="flex flex-wrap gap-4">
              <SelectField
                label="Size"
                value={String(size)}
                onChange={(v) => setSize(Number(v))}
                options={SIZES.map((s) => ({ value: String(s), label: `${s}px` }))}
              />
              <SelectField
                label="Error correction"
                value={ecLevel}
                onChange={(v) => setEcLevel(v as typeof ecLevel)}
                options={EC_LEVELS}
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-6">
            <canvas ref={canvasRef} className="rounded-[8px] bg-white" />
            {!text.trim() && (
              <p className="text-center text-[12px] text-[var(--text-faint)]">Your QR code preview will appear here.</p>
            )}
            <PrimaryButton onClick={download} disabled={!text.trim()} className="w-full">
              <Download size={13} /> Download PNG
            </PrimaryButton>
          </div>
        </PanelBody>

        <PanelFooter tone={error ? "danger" : "muted"}>
          {error ?? "Enter text above — the QR code updates automatically."}
        </PanelFooter>
      </ToolPanel>
    </div>
  );
}
