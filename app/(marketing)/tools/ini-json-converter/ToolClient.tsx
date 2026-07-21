"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function parseIni(input: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let section: Record<string, unknown> = result;
  input.split("\n").forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith(";") || line.startsWith("#")) return;
    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      const name = sectionMatch[1].trim();
      result[name] = {};
      section = result[name] as Record<string, unknown>;
      return;
    }
    const eq = line.indexOf("=");
    if (eq === -1) return;
    const key = line.slice(0, eq).trim();
    let val: unknown = line.slice(eq + 1).trim();
    if (val === "true") val = true;
    else if (val === "false") val = false;
    else if (/^-?\d+$/.test(val as string)) val = parseInt(val as string, 10);
    section[key] = val;
  });
  return result;
}

function iniToJsonConvert(input: string): string {
  if (!input.trim()) throw new Error("Paste INI content");
  return JSON.stringify(parseIni(input), null, 2);
}

function jsonToIniConvert(input: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON");
  }
  if (typeof data !== "object" || data === null) throw new Error("Top-level JSON must be an object");
  const obj = data as Record<string, unknown>;
  const rootLines: string[] = [];
  const sectionBlocks: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const lines = Object.entries(value as Record<string, unknown>).map(([k, v]) => `${k}=${v}`);
      sectionBlocks.push(`[${key}]\n${lines.join("\n")}`);
    } else {
      rootLines.push(`${key}=${value}`);
    }
  }
  return [rootLines.join("\n"), sectionBlocks.join("\n\n")].filter(Boolean).join("\n\n");
}

export default function IniJsonConverterPage() {
  const [mode, setMode] = useState("toJson");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="I⇄J"
        title="INI ⇄ JSON Converter"
        desc="Convert INI config files into JSON, or JSON back into INI — sections become nested objects."
      />
      <ToolLab
        inputLabel={mode === "toJson" ? "INI" : "JSON"}
        outputLabel={mode === "toJson" ? "JSON" : "INI"}
        placeholder={mode === "toJson" ? `[server]\nport=8080\ndebug=true` : `{\n  "server": { "port": 8080, "debug": true }\n}`}
        modes={[
          { value: "toJson", label: "INI → JSON" },
          { value: "toIni", label: "JSON → INI" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Enter content above, choose a direction — the result updates automatically."
        onRun={(input) => (mode === "toJson" ? iniToJsonConvert(input) : jsonToIniConvert(input))}
      />
    </div>
  );
}
