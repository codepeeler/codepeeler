"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { CheckboxOption } from "@/components/tools/FormFields";

export default function WhitespaceCleanerPage() {
  const [trimEachLine, setTrimEachLine] = useState(true);
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [collapseBlankLines, setCollapseBlankLines] = useState(false);
  const [tabsToSpaces, setTabsToSpaces] = useState(false);

  const run = (input: string): string => {
    let text = input;
    if (tabsToSpaces) text = text.replace(/\t/g, "    ");
    let lines = text.split(/\r\n|\r|\n/);
    if (trimEachLine) lines = lines.map((l) => l.trim());
    if (collapseSpaces) lines = lines.map((l) => l.replace(/ {2,}/g, " "));
    let out = lines.join("\n");
    if (collapseBlankLines) out = out.replace(/\n{3,}/g, "\n\n");
    return out;
  };

  const recalc = [trimEachLine, collapseSpaces, collapseBlankLines, tabsToSpaces].join(",");

  const TOGGLES: [string, boolean, (v: boolean) => void][] = [
    ["Trim each line", trimEachLine, setTrimEachLine],
    ["Collapse multiple spaces", collapseSpaces, setCollapseSpaces],
    ["Collapse multiple blank lines", collapseBlankLines, setCollapseBlankLines],
    ["Convert tabs to spaces", tabsToSpaces, setTabsToSpaces],
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="⎵"
        title="Whitespace Cleaner"
        desc="Trim, collapse, and normalize whitespace in messy text — extra spaces, tabs, and stray blank lines."
      />
      <ToolLab
        inputLabel="Text"
        outputLabel="Cleaned"
        placeholder={"  hello    world  \n\n\n\nnext line\t\there"}
        live
        recalcKey={recalc}
        emptyHint="Paste messy text above."
        settingsSlot={
          <>
            {TOGGLES.map(([label, value, setter]) => (
              <CheckboxOption key={label} label={label} checked={value} onChange={setter} />
            ))}
          </>
        }
        onRun={(input) => run(input)}
      />
    </div>
  );
}
