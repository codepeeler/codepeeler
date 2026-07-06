"use client";

import { useState } from "react";
import { Dices } from "lucide-react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import { PanelToolbar, PanelBody } from "@/components/tools/PanelParts";
import { CheckboxOption, NumberField } from "@/components/tools/FormFields";
import { PrimaryButton } from "@/components/tools/Buttons";
import CopyButton from "@/components/tools/CopyButton";

export default function RandomLinePickerPage() {
  const [input, setInput] = useState("");
  const [count, setCount] = useState(1);
  const [allowRepeats, setAllowRepeats] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  const lines = input.split(/\r\n|\r|\n/).filter((l) => l.trim() !== "");

  const pick = () => {
    if (lines.length === 0) {
      setPicked([]);
      return;
    }
    if (allowRepeats) {
      setPicked(Array.from({ length: count }, () => lines[Math.floor(Math.random() * lines.length)]));
    } else {
      const pool = [...lines];
      const result: string[] = [];
      const n = Math.min(count, pool.length);
      for (let i = 0; i < n; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        result.push(pool.splice(idx, 1)[0]);
      }
      setPicked(result);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="🎲"
        title="Random Line Picker"
        desc="Paste a list — names, options, tickets, whatever — and pick one or more random lines from it."
      />

      <ToolPanel>
        <PanelToolbar>
          <div className="flex flex-wrap items-center gap-4">
            <NumberField label="Pick" min={1} value={count} onChange={setCount} />
            <CheckboxOption label="Allow repeats" checked={allowRepeats} onChange={setAllowRepeats} />
          </div>
          <PrimaryButton onClick={pick}>
            <Dices size={13} /> Pick random
          </PrimaryButton>
        </PanelToolbar>

        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <FieldBox label={`List (${lines.length} lines)`} height="220px">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder={"Alice\nBob\nCharlie\nDiana"}
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.55] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>
          <FieldBox label="Picked" height="220px" right={<CopyButton value={picked.join("\n")} />}>
            <div className="p-3">
              {picked.length === 0 ? (
                <p className="text-[13px] text-[var(--text-faint)]">Paste a list and click &quot;Pick random&quot;.</p>
              ) : (
                <ol className="space-y-1.5">
                  {picked.map((p, i) => (
                    <li key={i} className="rounded-[6px] bg-[var(--card-hover)] px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[13px] text-[var(--text)]">
                      {p}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </FieldBox>
        </PanelBody>
      </ToolPanel>
    </div>
  );
}
