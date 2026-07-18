"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function envParse(input: string): string {
  if (!input.trim()) throw new Error("Paste .env content");
  const lines = input.split("\n");
  const result: Record<string, string> = {};
  const issues: string[] = [];
  const seen = new Set<string>();

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const eq = line.indexOf("=");
    if (eq === -1) {
      issues.push(`Line ${idx + 1}: missing "=" — "${line}"`);
      return;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) issues.push(`Line ${idx + 1}: invalid variable name "${key}"`);
    if (seen.has(key)) issues.push(`Line ${idx + 1}: duplicate key "${key}"`);
    seen.add(key);
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  });

  const out = [`// ${Object.keys(result).length} variable(s) parsed`, JSON.stringify(result, null, 2)];
  if (issues.length) out.push("", "// Issues:", issues.map((i) => `// - ${i}`).join("\n"));
  else out.push("", "// No issues found");
  return out.join("\n");
}

export default function EnvFileParserPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge=".env"
        title=".env File Parser / Validator"
        desc="Paste .env content to see it parsed as JSON and flag duplicate keys, bad names, and syntax issues."
      />
      <ToolLab
        inputLabel=".env content"
        outputLabel="Parsed JSON + issues"
        placeholder={`DATABASE_URL=postgres://localhost/db\nPORT=3000\nDEBUG=true`}
        live
        emptyHint="Paste .env content above — the parsed result updates automatically."
        onRun={(input) => envParse(input)}
      />
    </div>
  );
}
