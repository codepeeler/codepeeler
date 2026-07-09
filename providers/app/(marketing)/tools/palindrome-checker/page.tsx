"use client";

import { useMemo, useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import { PanelToolbar, PanelBody } from "@/components/tools/PanelParts";
import { CheckboxOption } from "@/components/tools/FormFields";
import VerdictBadge from "@/components/tools/VerdictBadge";

function normalize(s: string, ignoreSpaces: boolean, ignoreCase: boolean, ignorePunctuation: boolean): string {
  let out = s;
  if (ignorePunctuation) out = out.replace(/[^\w\s]/g, "");
  if (ignoreSpaces) out = out.replace(/\s+/g, "");
  if (ignoreCase) out = out.toLowerCase();
  return out;
}

export default function PalindromeCheckerPage() {
  const [input, setInput] = useState("");
  const [ignoreSpaces, setIgnoreSpaces] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(true);
  const [ignorePunctuation, setIgnorePunctuation] = useState(true);

  const { normalized, isPalindrome } = useMemo(() => {
    const n = normalize(input, ignoreSpaces, ignoreCase, ignorePunctuation);
    return { normalized: n, isPalindrome: n.length > 0 && n === [...n].reverse().join("") };
  }, [input, ignoreSpaces, ignoreCase, ignorePunctuation]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="◫◫"
        title="Palindrome Checker"
        desc="Check whether a word or phrase reads the same forwards and backwards — with configurable normalization."
      />

      <ToolPanel>
        <PanelToolbar className="justify-start">
          <CheckboxOption label="Ignore spaces" checked={ignoreSpaces} onChange={setIgnoreSpaces} />
          <CheckboxOption label="Ignore case" checked={ignoreCase} onChange={setIgnoreCase} />
          <CheckboxOption label="Ignore punctuation" checked={ignorePunctuation} onChange={setIgnorePunctuation} />
        </PanelToolbar>

        <PanelBody>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="A man, a plan, a canal: Panama"
            className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-3.5 py-3 text-[15px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
          />

          {input.trim() && (
            <div className="mt-4 flex items-center gap-3">
              <VerdictBadge pass={isPalindrome} passLabel="✓ It's a palindrome" failLabel="✗ Not a palindrome" />
              <span className="font-[family-name:var(--font-mono)] text-[12.5px] text-[var(--text-faint)]">
                normalized: &quot;{normalized}&quot;
              </span>
            </div>
          )}
        </PanelBody>
      </ToolPanel>
    </div>
  );
}
