"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function robotsValidate(input: string): string {
  if (!input.trim()) throw new Error("Paste robots.txt content");
  const lines = input.split("\n");
  const issues: string[] = [];
  const validDirectives = ["user-agent", "disallow", "allow", "sitemap", "crawl-delay", "host"];
  let currentAgent: string | null = null;
  let agentCount = 0;
  let sawRuleBeforeAgent = false;

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const colon = line.indexOf(":");
    if (colon === -1) {
      issues.push(`Line ${idx + 1}: no colon found — "${line}"`);
      return;
    }
    const directive = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (!validDirectives.includes(directive)) {
      issues.push(`Line ${idx + 1}: unknown directive "${directive}"`);
      return;
    }
    if (directive === "user-agent") {
      currentAgent = value;
      agentCount++;
      if (!value) issues.push(`Line ${idx + 1}: empty User-agent value`);
    } else if (directive === "disallow" || directive === "allow") {
      if (!currentAgent) sawRuleBeforeAgent = true;
      if (value && !value.startsWith("/") && value !== "*") {
        issues.push(`Line ${idx + 1}: "${directive}" path should start with "/" — got "${value}"`);
      }
    } else if (directive === "sitemap") {
      if (!/^https?:\/\//.test(value)) issues.push(`Line ${idx + 1}: Sitemap should be an absolute URL`);
    } else if (directive === "crawl-delay") {
      if (isNaN(Number(value))) issues.push(`Line ${idx + 1}: Crawl-delay should be a number`);
    }
  });

  if (sawRuleBeforeAgent) issues.push("Found a Disallow/Allow rule before any User-agent line");
  if (agentCount === 0) issues.push("No User-agent directive found");

  return issues.length
    ? `Found ${issues.length} issue(s):\n\n${issues.map((i) => `✗ ${i}`).join("\n")}`
    : "✓ No issues found — robots.txt looks valid.";
}

export default function RobotsTxtValidatorPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="/rb"
        title="robots.txt Validator"
        desc="Paste your robots.txt to catch unknown directives, misplaced rules, and other common syntax mistakes."
      />
      <ToolLab
        inputLabel="robots.txt"
        outputLabel="Validation report"
        placeholder={`User-agent: *\nDisallow: /admin\nAllow: /\nSitemap: https://example.com/sitemap.xml`}
        live
        emptyHint="Paste robots.txt content above — the validation report updates automatically."
        onRun={(input) => robotsValidate(input)}
      />
    </div>
  );
}
