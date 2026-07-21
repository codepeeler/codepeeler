"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function validatePackageJson(input: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch (e) {
    throw new Error("Invalid JSON: " + (e instanceof Error ? e.message : ""));
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) throw new Error("package.json must be a JSON object");
  const obj = data as Record<string, unknown>;
  const issues: string[] = [];
  if (!obj.name) issues.push("Missing required field: name");
  else if (typeof obj.name === "string" && !/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(obj.name)) {
    issues.push('"name" contains invalid characters for an npm package name');
  }
  if (!obj.version) issues.push("Missing required field: version");
  else if (typeof obj.version === "string" && !/^\d+\.\d+\.\d+/.test(obj.version)) issues.push('"version" should follow semver (e.g. 1.0.0)');
  if (obj.dependencies && typeof obj.dependencies !== "object") issues.push('"dependencies" must be an object');
  if (obj.scripts && typeof obj.scripts !== "object") issues.push('"scripts" must be an object');
  if (obj.main && typeof obj.main !== "string") issues.push('"main" must be a string');
  if (obj.dependencies && obj.devDependencies) {
    for (const k of Object.keys(obj.dependencies as object)) {
      if (k in (obj.devDependencies as object)) issues.push(`"${k}" listed in both dependencies and devDependencies`);
    }
  }
  const formatted = JSON.stringify(obj, null, 2);
  const report = issues.length ? `Found ${issues.length} issue(s):\n${issues.map((i) => `✗ ${i}`).join("\n")}` : "✓ No issues found.";
  return `${report}\n\n// Formatted:\n${formatted}`;
}

export default function PackageJsonValidatorPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="pkg"
        title="package.json Validator"
        desc="Paste a package.json to check required fields, catch common mistakes, and get a formatted copy."
      />
      <ToolLab
        inputLabel="package.json"
        outputLabel="Validation + formatted"
        placeholder={`{\n  "name": "my-app",\n  "version": "1.0.0"\n}`}
        live
        emptyHint="Paste package.json content above — the report updates automatically."
        onRun={(input) => validatePackageJson(input)}
      />
    </div>
  );
}
