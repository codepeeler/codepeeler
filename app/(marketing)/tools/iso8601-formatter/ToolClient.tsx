"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function iso8601Format(input: string): string {
  const raw = input.trim();
  const d = new Date(raw);
  if (isNaN(d.getTime())) throw new Error("Couldn't parse that as a date/time");
  const iso = d.toISOString();
  return [
    `ISO 8601: ${iso}`,
    `Date only: ${iso.slice(0, 10)}`,
    `Unix ms:   ${d.getTime()}`,
    `Unix sec:  ${Math.floor(d.getTime() / 1000)}`,
    `Weekday:   ${d.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })}`,
  ].join("\n");
}

export default function Iso8601FormatterPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="📅"
        title="ISO 8601 Formatter / Validator"
        desc="Paste any date or date-time and get a validated ISO 8601 string plus a quick breakdown."
      />
      <ToolLab
        inputLabel="Date / Date-Time"
        outputLabel="ISO 8601"
        placeholder="e.g. 2026-07-17T14:30:00Z, July 17 2026, or 1752762600000"
        live
        monospaceInput={false}
        emptyHint="Enter a date above — the ISO 8601 breakdown updates automatically."
        onRun={(input) => iso8601Format(input)}
      />
    </div>
  );
}
