"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function lintDockerfile(input: string): string {
  if (!input.trim()) throw new Error("Paste Dockerfile content");
  const lines = input.split("\n");
  const issues: string[] = [];
  let sawFrom = false;

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const instruction = line.split(/\s+/)[0].toUpperCase();
    if (instruction === "FROM") {
      sawFrom = true;
      const image = line.split(/\s+/)[1] || "";
      if (/:latest\b/.test(line) || !image.includes(":")) {
        issues.push(`Line ${idx + 1}: pin a specific tag instead of ":latest" or an untagged image`);
      }
    } else if (!sawFrom && instruction !== "ARG") {
      issues.push(`Line ${idx + 1}: "${instruction}" appears before any FROM instruction`);
    }
    if (instruction === "RUN" && /apt-get install/.test(line) && !/apt-get update/.test(input)) {
      issues.push(`Line ${idx + 1}: "apt-get install" without a preceding "apt-get update" can use a stale cache`);
    }
    if (instruction === "ADD" && !/https?:\/\//.test(line)) {
      issues.push(`Line ${idx + 1}: prefer COPY over ADD for local files (ADD has extra, often-unwanted behavior)`);
    }
    if (instruction === "MAINTAINER") {
      issues.push(`Line ${idx + 1}: MAINTAINER is deprecated — use a LABEL instead`);
    }
  });

  if (!sawFrom) issues.unshift("No FROM instruction found");

  return issues.length
    ? `Found ${issues.length} issue(s):\n\n${issues.map((i) => `✗ ${i}`).join("\n")}`
    : "✓ No issues found — Dockerfile looks reasonable.";
}

export default function DockerfileLinterPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="🐳"
        title="Dockerfile Linter"
        desc="Paste a Dockerfile to catch common mistakes — unpinned base images, ADD misuse, stale apt caches, and more."
      />
      <ToolLab
        inputLabel="Dockerfile"
        outputLabel="Lint report"
        placeholder={`FROM node:20-alpine\nWORKDIR /app\nCOPY package.json .\nRUN npm install\nCOPY . .\nCMD ["node", "index.js"]`}
        live
        emptyHint="Paste a Dockerfile above — the lint report updates automatically."
        onRun={(input) => lintDockerfile(input)}
      />
    </div>
  );
}
