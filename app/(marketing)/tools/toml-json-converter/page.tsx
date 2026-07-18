"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function parseTomlValue(raw: string): unknown {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+$/.test(raw)) return parseInt(raw, 10);
  if (/^-?\d*\.\d+$/.test(raw)) return parseFloat(raw);
  if (raw.startsWith("[") && raw.endsWith("]")) {
    const inner = raw.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((v) => parseTomlValue(v.trim()));
  }
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  return raw;
}

function parseToml(input: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let current: Record<string, unknown> = result;
  input.split("\n").forEach((rawLine) => {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) return;
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      const path = sectionMatch[1].split(".").map((s) => s.trim());
      current = result;
      for (const p of path) {
        if (!(p in current) || typeof current[p] !== "object") current[p] = {};
        current = current[p] as Record<string, unknown>;
      }
      return;
    }
    const eq = line.indexOf("=");
    if (eq === -1) return;
    const key = line.slice(0, eq).trim();
    current[key] = parseTomlValue(line.slice(eq + 1).trim());
  });
  return result;
}

function tomlToJsonConvert(input: string): string {
  if (!input.trim()) throw new Error("Paste TOML content");
  return JSON.stringify(parseToml(input), null, 2);
}

function tomlValueLiteral(v: unknown): string {
  if (typeof v === "string") return `"${v.replace(/"/g, '\\"')}"`;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `[${v.map(tomlValueLiteral).join(", ")}]`;
  return `"${String(v)}"`;
}

function serializeToml(obj: Record<string, unknown>, prefix = ""): string {
  const scalarLines: string[] = [];
  const sectionLines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const path = prefix ? `${prefix}.${key}` : key;
      sectionLines.push(`[${path}]\n${serializeToml(value as Record<string, unknown>, path)}`);
    } else {
      scalarLines.push(`${key} = ${tomlValueLiteral(value)}`);
    }
  }
  return [scalarLines.join("\n"), sectionLines.join("\n")].filter(Boolean).join("\n\n");
}

function jsonToTomlConvert(input: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON");
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) throw new Error("Top-level JSON must be an object");
  return serializeToml(data as Record<string, unknown>);
}

export default function TomlJsonConverterPage() {
  const [mode, setMode] = useState("toJson");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="T⇄J"
        title="TOML ⇄ JSON Converter"
        desc="Convert TOML config into JSON, or JSON back into TOML. Supports tables, arrays, strings, numbers, and booleans."
      />
      <ToolLab
        inputLabel={mode === "toJson" ? "TOML" : "JSON"}
        outputLabel={mode === "toJson" ? "JSON" : "TOML"}
        placeholder={mode === "toJson" ? `title = "My App"\n\n[server]\nport = 8080\ndebug = true` : `{\n  "title": "My App",\n  "server": { "port": 8080, "debug": true }\n}`}
        modes={[
          { value: "toJson", label: "TOML → JSON" },
          { value: "toToml", label: "JSON → TOML" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Enter content above, choose a direction — the result updates automatically."
        onRun={(input) => (mode === "toJson" ? tomlToJsonConvert(input) : jsonToTomlConvert(input))}
      />
    </div>
  );
}
