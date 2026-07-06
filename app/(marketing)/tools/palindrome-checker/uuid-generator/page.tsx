"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import { PanelToolbar, PanelBody } from "@/components/tools/PanelParts";
import { CheckboxOption, NumberField } from "@/components/tools/FormFields";
import { OutlineButton, PrimaryButton } from "@/components/tools/Buttons";
import CopyButton from "@/components/tools/CopyButton";
import { useToast } from "@/providers/toast-provider";

export default function UuidGeneratorPage() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 5 }, () => crypto.randomUUID()));
  const { toast } = useToast();

  const format = (id: string) => {
    const out = hyphens ? id : id.replace(/-/g, "");
    return uppercase ? out.toUpperCase() : out;
  };

  const regenerate = (n = count) => {
    setUuids(Array.from({ length: n }, () => crypto.randomUUID()));
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(uuids.map(format).join("\n"));
      toast(`Copied ${uuids.length} UUIDs`);
    } catch {
      toast("Couldn't copy — try selecting manually");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="id"
        title="UUID Generator"
        desc="Generate random version 4 UUIDs using the browser's cryptographically secure random generator."
      />

      <ToolPanel>
        <PanelToolbar>
          <div className="flex flex-wrap items-center gap-4">
            <NumberField
              label="Count"
              min={1}
              max={100}
              value={count}
              onChange={(n) => {
                setCount(n);
                regenerate(n);
              }}
            />
            <CheckboxOption label="Uppercase" checked={uppercase} onChange={setUppercase} />
            <CheckboxOption label="Hyphens" checked={hyphens} onChange={setHyphens} />
          </div>
          <div className="flex items-center gap-2">
            <OutlineButton onClick={copyAll}>Copy all</OutlineButton>
            <PrimaryButton onClick={() => regenerate()}>
              <RefreshCw size={13} /> Generate
            </PrimaryButton>
          </div>
        </PanelToolbar>

        <PanelBody className="max-h-[420px] space-y-1.5 overflow-auto">
          {uuids.map((id, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5"
            >
              <span className="font-[family-name:var(--font-mono)] text-[13px] text-[var(--text)]">{format(id)}</span>
              <CopyButton value={format(id)} />
            </div>
          ))}
        </PanelBody>
      </ToolPanel>
    </div>
  );
}
