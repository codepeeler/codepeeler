"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import { PanelToolbar, PanelBody } from "@/components/tools/PanelParts";
import { NumberField } from "@/components/tools/FormFields";
import { PrimaryButton } from "@/components/tools/Buttons";
import CopyButton from "@/components/tools/CopyButton";

function randomNumberGenerate(min: number, max: number, count: number): string {
  if (min > max) throw new Error("Min must be less than or equal to Max");
  const n = Math.max(1, Math.min(Math.round(count), 1000));
  const range = max - min + 1;
  const arr = new Uint32Array(n);
  crypto.getRandomValues(arr);
  const results: number[] = [];
  for (let i = 0; i < n; i++) results.push(min + (arr[i] % range));
  return results.join("\n");
}

export default function RandomNumberGeneratorPage() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const regenerate = () => {
    try {
      setOutput(randomNumberGenerate(min, max, count));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="0-9"
        title="Random Number Generator"
        desc="Generate cryptographically random integers within a range using the browser's secure random generator."
      />

      <ToolPanel>
        <PanelToolbar>
          <div className="flex flex-wrap items-center gap-4">
            <NumberField label="Min" value={min} onChange={setMin} />
            <NumberField label="Max" value={max} onChange={setMax} />
            <NumberField label="Count" min={1} max={1000} value={count} onChange={setCount} />
          </div>
          <div className="flex items-center gap-2">
            <CopyButton value={output} />
            <PrimaryButton onClick={regenerate}>
              <RefreshCw size={13} /> Generate
            </PrimaryButton>
          </div>
        </PanelToolbar>

        <PanelBody>
          {error ? (
            <p className="text-[13px] text-[var(--danger)]">{error}</p>
          ) : (
            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4 text-[13.5px] leading-[1.65] text-[var(--text)]">
              {output}
            </pre>
          )}
        </PanelBody>
      </ToolPanel>
    </div>
  );
}
