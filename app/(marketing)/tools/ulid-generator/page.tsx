"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import { PanelToolbar, PanelBody } from "@/components/tools/PanelParts";
import { NumberField } from "@/components/tools/FormFields";
import { PrimaryButton } from "@/components/tools/Buttons";
import CopyButton from "@/components/tools/CopyButton";

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function ulidEncodeTime(time: number, len: number): string {
  let str = "";
  for (let i = len - 1; i >= 0; i--) {
    const mod = time % 32;
    str = CROCKFORD[mod] + str;
    time = (time - mod) / 32;
  }
  return str;
}

function ulidEncodeRandom(len: number): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let str = "";
  for (let i = 0; i < len; i++) str += CROCKFORD[bytes[i] % 32];
  return str;
}

function generateUlid(): string {
  return ulidEncodeTime(Date.now(), 10) + ulidEncodeRandom(16);
}

export default function UlidGeneratorPage() {
  const [count, setCount] = useState(5);
  const [ulids, setUlids] = useState<string[]>([]);

  const regenerate = () => setUlids(Array.from({ length: count }, () => generateUlid()));

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="ulid"
        title="ULID Generator"
        desc="Generate ULIDs — sortable, timestamp-prefixed unique IDs that are a popular alternative to UUIDs."
      />

      <ToolPanel>
        <PanelToolbar>
          <div className="flex flex-wrap items-center gap-4">
            <NumberField label="Count" min={1} max={100} value={count} onChange={setCount} />
          </div>
          <div className="flex items-center gap-2">
            <CopyButton value={ulids.join("\n")} />
            <PrimaryButton onClick={regenerate}>
              <RefreshCw size={13} /> Generate
            </PrimaryButton>
          </div>
        </PanelToolbar>

        <PanelBody>
          <div className="max-h-[420px] space-y-1.5 overflow-auto">
            {ulids.map((id, i) => (
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
