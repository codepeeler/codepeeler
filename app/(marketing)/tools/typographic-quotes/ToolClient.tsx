"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { CheckboxOption } from "@/components/tools/FormFields";

function toSmart(input: string, smartenDashes: boolean, smartenEllipsis: boolean): string {
  let s = input;
  // Double quotes: opening after whitespace/start/punctuation-open, else closing
  s = s.replace(/(^|[\s([{-])"/g, "$1\u201C");
  s = s.replace(/"/g, "\u201D");
  // Single quotes / apostrophes
  s = s.replace(/(^|[\s([{-])'/g, "$1\u2018");
  s = s.replace(/'/g, "\u2019");
  if (smartenDashes) {
    s = s.replace(/(\w)--(\w)/g, "$1\u2014$2"); // -- -> em dash
    s = s.replace(/(\d)-(\d)/g, "$1\u2013$2"); // number ranges -> en dash
  }
  if (smartenEllipsis) s = s.replace(/\.\.\./g, "\u2026");
  return s;
}

function toStraight(input: string): string {
  return input
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...");
}

export default function TypographicQuotesPage() {
  const [mode, setMode] = useState<"smart" | "straight">("smart");
  const [smartenDashes, setSmartenDashes] = useState(true);
  const [smartenEllipsis, setSmartenEllipsis] = useState(true);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="“ ”"
        title="Typographic Quotes Converter"
        desc="Convert straight quotes to curly typographic quotes (and dashes/ellipses) for publishing — or flatten back to plain ASCII."
      />
      <ToolLab
        inputLabel={mode === "smart" ? 'Straight quotes ("...")' : "Curly quotes (“...”)"}
        outputLabel={mode === "smart" ? "Curly quotes" : "Straight quotes"}
        placeholder={mode === "smart" ? `He said, "it's ready" -- finally... 10-20 items` : "He said, “it’s ready” — finally… 10–20 items"}
        modes={[
          { value: "smart", label: "Straight → Curly" },
          { value: "straight", label: "Curly → Straight" },
        ]}
        mode={mode}
        onModeChange={(m) => setMode(m as typeof mode)}
        recalcKey={`${smartenDashes}-${smartenEllipsis}`}
        live
        monospaceInput={false}
        emptyHint="Type or paste text above."
        settingsSlot={
          mode === "smart" ? (
            <>
              <CheckboxOption label="Smarten dashes (-- → em dash)" checked={smartenDashes} onChange={setSmartenDashes} />
              <CheckboxOption label="Smarten ellipsis (... → …)" checked={smartenEllipsis} onChange={setSmartenEllipsis} />
            </>
          ) : undefined
        }
        onRun={(input) => (mode === "smart" ? toSmart(input, smartenDashes, smartenEllipsis) : toStraight(input))}
      />
    </div>
  );
}
