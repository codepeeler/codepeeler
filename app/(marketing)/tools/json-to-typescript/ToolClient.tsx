"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { TextField } from "@/components/tools/FormFields";

function jsonToTs(input: string, rootName: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON");
  }
  const interfaces: string[] = [];
  const seen = new Set<string>();

  function capitalize(s: string): string {
    const clean = s
      .replace(/[^a-zA-Z0-9]/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");
    const safe = clean || "Field";
    return /^[A-Za-z_]/.test(safe) ? safe : "I" + safe;
  }

  function typeOf(value: unknown, name: string): string {
    if (value === null) return "null";
    if (Array.isArray(value)) {
      if (value.length === 0) return "unknown[]";
      const elTypes = Array.from(new Set(value.map((v) => typeOf(v, name.replace(/s$/, "")))));
      return elTypes.length === 1 ? `${elTypes[0]}[]` : `(${elTypes.join(" | ")})[]`;
    }
    const t = typeof value;
    if (t === "object") {
      const iName = capitalize(name);
      buildInterface(value as Record<string, unknown>, iName);
      return iName;
    }
    if (t === "number" || t === "string" || t === "boolean") return t;
    return "unknown";
  }

  function buildInterface(obj: Record<string, unknown>, name: string) {
    const lines: string[] = [`interface ${name} {`];
    for (const key of Object.keys(obj)) {
      const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `"${key}"`;
      lines.push(`  ${safeKey}: ${typeOf(obj[key], key)};`);
    }
    lines.push("}");
    if (!seen.has(name)) {
      seen.add(name);
      interfaces.push(lines.join("\n"));
    }
  }

  const root = capitalize(rootName || "Root");
  if (Array.isArray(data)) {
    const elType = typeOf(data[0] ?? {}, root);
    interfaces.push(`type ${root} = ${elType}[];`);
  } else if (data && typeof data === "object") {
    buildInterface(data as Record<string, unknown>, root);
  } else {
    throw new Error("Top-level JSON must be an object or array");
  }

  return interfaces.join("\n\n");
}

export default function JsonToTsPage() {
  const [rootName, setRootName] = useState("Root");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="TS"
        title="JSON to TypeScript Interface"
        desc="Paste a JSON sample and generate matching TypeScript interfaces — nested objects become their own named interfaces."
      />
      <ToolLab
        inputLabel="JSON"
        outputLabel="TypeScript"
        placeholder={`{\n  "id": 1,\n  "name": "Ada",\n  "tags": ["admin", "beta"]\n}`}
        live
        recalcKey={rootName}
        settingsSlot={<TextField label="Root name" value={rootName} onChange={setRootName} width="w-28" />}
        emptyHint="Paste JSON above — the TypeScript interface updates automatically."
        onRun={(input) => jsonToTs(input, rootName)}
      />
    </div>
  );
}
