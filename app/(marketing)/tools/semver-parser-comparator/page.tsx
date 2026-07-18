"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function parseSemver(v: string): { major: number; minor: number; patch: number; prerelease: string; build: string } {
  const m = v.trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/);
  if (!m) throw new Error(`"${v}" is not a valid semver version`);
  return { major: +m[1], minor: +m[2], patch: +m[3], prerelease: m[4] || "", build: m[5] || "" };
}

function semverParseTool(input: string): string {
  const v = parseSemver(input);
  return [
    `Major:      ${v.major}`,
    `Minor:      ${v.minor}`,
    `Patch:      ${v.patch}`,
    `Prerelease: ${v.prerelease || "none"}`,
    `Build:      ${v.build || "none"}`,
  ].join("\n");
}

function compareSemverParsed(a: ReturnType<typeof parseSemver>, b: ReturnType<typeof parseSemver>): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  if (!a.prerelease && b.prerelease) return 1;
  if (a.prerelease && !b.prerelease) return -1;
  if (a.prerelease && b.prerelease) return a.prerelease.localeCompare(b.prerelease);
  return 0;
}

function semverCompareTool(input: string): string {
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length !== 2) throw new Error("Enter two versions separated by a comma, e.g. 1.2.3, 1.3.0");
  const a = parseSemver(parts[0]);
  const b = parseSemver(parts[1]);
  const cmp = compareSemverParsed(a, b);
  return cmp === 0
    ? `${parts[0]} is equal to ${parts[1]}`
    : cmp > 0
      ? `${parts[0]} is greater than ${parts[1]}`
      : `${parts[0]} is less than ${parts[1]}`;
}

export default function SemverParserComparatorPage() {
  const [mode, setMode] = useState("parse");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="semv"
        title="Semver Parser / Comparator"
        desc="Break a semantic version into major, minor, patch, prerelease, and build parts — or compare two versions."
      />
      <ToolLab
        inputLabel={mode === "parse" ? "Version" : "Two versions (comma-separated)"}
        outputLabel={mode === "parse" ? "Breakdown" : "Comparison"}
        placeholder={mode === "parse" ? "1.4.2-beta.1+build.5" : "1.2.3, 1.3.0"}
        modes={[
          { value: "parse", label: "Parse" },
          { value: "compare", label: "Compare" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Enter a version above — the result updates automatically."
        onRun={(input) => (mode === "parse" ? semverParseTool(input) : semverCompareTool(input))}
      />
    </div>
  );
}
