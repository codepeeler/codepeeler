"use client";

import { load as loadYaml } from "js-yaml";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function validateDockerCompose(input: string): string {
  if (!input.trim()) throw new Error("Paste docker-compose.yml content");
  let data: unknown;
  try {
    data = loadYaml(input);
  } catch (e) {
    throw new Error("Invalid YAML: " + (e instanceof Error ? e.message : ""));
  }
  if (typeof data !== "object" || data === null) throw new Error("Top-level content must be a YAML mapping");
  const obj = data as Record<string, unknown>;
  const issues: string[] = [];
  if (!obj.services) issues.push("Missing top-level 'services' key");
  else if (typeof obj.services === "object") {
    for (const [name, svc] of Object.entries(obj.services as Record<string, unknown>)) {
      if (typeof svc !== "object" || svc === null) {
        issues.push(`Service "${name}": must be a mapping`);
        continue;
      }
      const s = svc as Record<string, unknown>;
      if (!s.image && !s.build) issues.push(`Service "${name}": needs either "image" or "build"`);
      if (s.ports && !Array.isArray(s.ports)) issues.push(`Service "${name}": "ports" should be a list`);
      if (s.environment && typeof s.environment !== "object") issues.push(`Service "${name}": "environment" should be a list or mapping`);
    }
  }
  return issues.length
    ? `Found ${issues.length} issue(s):\n\n${issues.map((i) => `✗ ${i}`).join("\n")}`
    : "✓ No issues found — docker-compose.yml looks reasonable.";
}

export default function DockerComposeValidatorPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="🐳"
        title="Docker Compose Validator"
        desc="Paste a docker-compose.yml to check for missing services, invalid image/build fields, and structural mistakes."
      />
      <ToolLab
        inputLabel="docker-compose.yml"
        outputLabel="Validation report"
        placeholder={`services:\n  web:\n    image: nginx:1.27\n    ports:\n      - "80:80"`}
        live
        emptyHint="Paste docker-compose.yml content above — the report updates automatically."
        onRun={(input) => validateDockerCompose(input)}
      />
    </div>
  );
}
