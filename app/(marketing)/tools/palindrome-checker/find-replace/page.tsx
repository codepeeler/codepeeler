"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { CheckboxOption } from "@/components/tools/FormFields";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function FindReplacePage() {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [global, setGlobal] = useState(true);

  const run = (input: string): string => {
    if (!find) return input;
    const flags = `${global ? "g" : ""}${caseSensitive ? "" : "i"}`;
    const pattern = useRegex ? find : escapeRegExp(find);
    const re = new RegExp(pattern, flags);
    return input.replace(re, replace);
  };

  const recalc = `${find}|${replace}|${useRegex}|${caseSensitive}|${global}`;

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="⇄"
        title="Find & Replace"
        desc="Find and replace text across a block — supports plain text or full regular expressions with capture groups."
      />
      <ToolLab
        inputLabel="Text"
        outputLabel="Result"
        placeholder="Paste text to search and replace within..."
        live
        recalcKey={recalc}
        emptyHint="Enter a find pattern and paste text above."
        settingsSlot={
          <div className="flex w-full flex-wrap items-center gap-3">
            <input
              value={find}
              onChange={(e) => setFind(e.target.value)}
              placeholder={useRegex ? "Pattern, e.g. \\d+" : "Find..."}
              spellCheck={false}
              className="min-w-[160px] flex-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[12.5px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
            <input
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              placeholder="Replace with..."
              spellCheck={false}
              className="min-w-[160px] flex-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[12.5px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
            <CheckboxOption label="Regex" checked={useRegex} onChange={setUseRegex} />
            <CheckboxOption label="Case-sensitive" checked={caseSensitive} onChange={setCaseSensitive} />
            <CheckboxOption label="Replace all" checked={global} onChange={setGlobal} />
          </div>
        }
        onRun={(input) => run(input)}
      />
    </div>
  );
}
