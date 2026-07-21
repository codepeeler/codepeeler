"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function dateDifference(input: string): string {
  const parts = input.split(/[,\n]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) throw new Error("Enter two dates separated by a comma, e.g. 2026-01-01, 2026-07-17");
  const d1 = new Date(parts[0]);
  const d2 = new Date(parts[1]);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) throw new Error("Couldn't parse one of those dates");
  const [early, late] = d1.getTime() <= d2.getTime() ? [d1, d2] : [d2, d1];
  const totalMs = late.getTime() - early.getTime();
  const totalDays = Math.floor(totalMs / 86400000);
  let years = late.getFullYear() - early.getFullYear();
  let months = late.getMonth() - early.getMonth();
  let days = late.getDate() - early.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(late.getFullYear(), late.getMonth(), 0).getDate();
    days += prevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return [
    `${years} years, ${months} months, ${days} days`,
    `Total days: ${totalDays}`,
    `Total weeks: ${round4(totalDays / 7)}`,
    `Total hours: ${Math.floor(totalMs / 3600000)}`,
  ].join("\n");
}

export default function DateDifferenceCalculatorPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="Δd"
        title="Date Difference Calculator"
        desc="Find the exact gap between two dates — in years/months/days, total days, weeks & hours."
      />
      <ToolLab
        inputLabel="Two Dates"
        outputLabel="Difference"
        placeholder="e.g. 2026-01-01, 2026-07-17"
        live
        monospaceInput={false}
        emptyHint="Enter two dates separated by a comma above — the difference updates automatically."
        onRun={(input) => dateDifference(input)}
      />
    </div>
  );
}
