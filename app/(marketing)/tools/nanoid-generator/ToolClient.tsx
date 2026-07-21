"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import { PanelToolbar, PanelBody } from "@/components/tools/PanelParts";
import { NumberField, SelectField } from "@/components/tools/FormFields";
import { PrimaryButton } from "@/components/tools/Buttons";
import CopyButton from "@/components/tools/CopyButton";

const NANOID_ALPHABETS: Record<string, string> = {
  urlsafe: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-",
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  numeric: "0123456789",
  hex: "0123456789abcdef",
};

function nanoidGenerate(length: number, alphabetKey: string): string {
  const alphabet = NANOID_ALPHABETS[alphabetKey] ?? NANOID_ALPHABETS.urlsafe;
  const len = Math.max(1, Math.min(Math.round(length), 256));
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[arr[i] % alphabet.length];
  return out;
}

export default function NanoidGeneratorPage() {
  const [length, setLength] = useState(21);
  const [alphabet, setAlphabet] = useState("urlsafe");
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>([]);

  const regenerate = () => {
    setIds(Array.from({ length: count }, () => nanoidGenerate(length, alphabet)));
  };

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, alphabet, count]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="nid"
        title="Nanoid Generator"
        desc="Generate compact, URL-safe unique IDs — a smaller alternative to UUIDs, using the browser's secure random generator."
      />

      <ToolPanel>
        <PanelToolbar>
          <div className="flex flex-wrap items-center gap-4">
            <NumberField label="Length" min={1} max={256} value={length} onChange={setLength} />
            <SelectField
              label="Alphabet"
              value={alphabet}
              onChange={setAlphabet}
              options={[
                { value: "urlsafe", label: "URL-safe" },
                { value: "alpha", label: "Letters only" },
                { value: "numeric", label: "Numbers only" },
                { value: "hex", label: "Hex" },
              ]}
            />
            <NumberField label="Count" min={1} max={100} value={count} onChange={setCount} />
          </div>
          <div className="flex items-center gap-2">
            <CopyButton value={ids.join("\n")} />
            <PrimaryButton onClick={regenerate}>
              <RefreshCw size={13} /> Generate
            </PrimaryButton>
          </div>
        </PanelToolbar>

        <PanelBody>
          <div className="max-h-[420px] space-y-1.5 overflow-auto">
            {ids.map((id, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5"
              >
                <span className="font-[family-name:var(--font-mono)] text-[13px] text-[var(--text)]">{id}</span>
                <CopyButton value={id} />
              </div>
            ))}
          </div>
        </PanelBody>
      </ToolPanel>
    </div>
  );
}
