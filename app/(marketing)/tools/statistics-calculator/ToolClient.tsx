"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function statisticsCalc(input: string): string {
  const nums = input
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
  if (nums.length === 0 || nums.some((n) => isNaN(n))) throw new Error("Enter numbers separated by commas or newlines");
  const sorted = [...nums].sort((a, b) => a - b);
  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / nums.length;
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const freq = new Map<number, number>();
  nums.forEach((n) => freq.set(n, (freq.get(n) ?? 0) + 1));
  const maxFreq = Math.max(...freq.values());
  const modes = maxFreq > 1 ? [...freq.entries()].filter(([, c]) => c === maxFreq).map(([v]) => v) : [];
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
  const stddev = Math.sqrt(variance);
  return [
    `Count:    ${nums.length}`,
    `Sum:      ${sum}`,
    `Mean:     ${mean.toFixed(4)}`,
    `Median:   ${median}`,
    `Mode:     ${modes.length ? modes.join(", ") : "none"}`,
    `Min:      ${sorted[0]}`,
    `Max:      ${sorted[sorted.length - 1]}`,
    `Range:    ${sorted[sorted.length - 1] - sorted[0]}`,
    `Variance: ${variance.toFixed(4)}`,
    `Std Dev:  ${stddev.toFixed(4)}`,
  ].join("\n");
}

export default function StatisticsCalculatorPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="σ"
        title="Statistics Calculator"
        desc="Enter a list of numbers to get count, sum, mean, median, mode, range, variance, and standard deviation."
      />
      <ToolLab
        inputLabel="Numbers"
        outputLabel="Statistics"
        placeholder={`4, 8, 15, 16, 23, 42`}
        live
        emptyHint="Enter numbers above, separated by commas or newlines — the stats update automatically."
        onRun={(input) => statisticsCalc(input)}
      />
    </div>
  );
}
