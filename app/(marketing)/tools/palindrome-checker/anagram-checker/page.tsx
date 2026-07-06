"use client";

import { useMemo, useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import { PanelToolbar, PanelBody } from "@/components/tools/PanelParts";
import { CheckboxOption } from "@/components/tools/FormFields";
import VerdictBadge from "@/components/tools/VerdictBadge";

function normalizeToLetters(s: string, ignoreSpaces: boolean): string {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  return (ignoreSpaces ? cleaned.replace(/\s+/g, "") : cleaned).split("").sort().join("");
}

export default function AnagramCheckerPage() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [ignoreSpaces, setIgnoreSpaces] = useState(true);

  const isAnagram = useMemo(() => {
    if (!a.trim() || !b.trim()) return null;
    return normalizeToLetters(a, ignoreSpaces) === normalizeToLetters(b, ignoreSpaces);
  }, [a, b, ignoreSpaces]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="⇌A"
        title="Anagram Checker"
        desc="Check whether two words or phrases are anagrams of each other — same letters, any order."
      />

      <ToolPanel>
        <PanelToolbar className="justify-start">
          <CheckboxOption label="Ignore spaces" checked={ignoreSpaces} onChange={setIgnoreSpaces} />
        </PanelToolbar>

        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <input
            value={a}
            onChange={(e) => setA(e.target.value)}
            placeholder="listen"
            className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-3.5 py-3 text-[15px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
          />
          <input
            value={b}
            onChange={(e) => setB(e.target.value)}
            placeholder="silent"
            className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-3.5 py-3 text-[15px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
          />
        </PanelBody>

        {isAnagram !== null && (
          <div className="border-t border-[var(--border-soft)] p-4">
            <VerdictBadge pass={isAnagram} passLabel="✓ These are anagrams" failLabel="✗ Not anagrams" />
          </div>
        )}
      </ToolPanel>
    </div>
  );
}
