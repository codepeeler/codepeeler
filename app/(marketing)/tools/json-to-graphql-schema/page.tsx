"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { TextField } from "@/components/tools/FormFields";

function jsonToGraphQL(input: string, typeName: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON");
  }
  const sample = Array.isArray(data) ? data[0] : data;
  if (typeof sample !== "object" || sample === null) throw new Error("Top-level JSON must be an object (or array of objects)");

  const types: string[] = [];
  const seen = new Set<string>();

  function capitalize(s: string): string {
    const clean = s.replace(/[^a-zA-Z0-9]/g, " ").trim().split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
    return clean || "Field";
  }

  function gqlType(value: unknown, name: string): string {
    if (value === null) return "String";
    if (Array.isArray(value)) return `[${gqlType(value[0] ?? "", name)}]`;
    const t = typeof value;
    if (t === "string") return "String";
    if (t === "boolean") return "Boolean";
    if (t === "number") return Number.isInteger(value) ? "Int" : "Float";
    if (t === "object") {
      const iName = capitalize(name);
      buildType(value as Record<string, unknown>, iName);
      return iName;
    }
    return "String";
  }

  function buildType(obj: Record<string, unknown>, name: string) {
    if (seen.has(name)) return;
    seen.add(name);
    const lines = [`type ${name} {`];
    for (const [k, v] of Object.entries(obj)) lines.push(`  ${k}: ${gqlType(v, k)}`);
    lines.push("}");
    types.push(lines.join("\n"));
  }

  buildType(sample as Record<string, unknown>, capitalize(typeName || "Root"));
  return types.join("\n\n");
}

export default function JsonToGraphqlSchemaPage() {
  const [name, setName] = useState("Root");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="gql"
        title="JSON to GraphQL SDL"
        desc="Paste a JSON sample and generate matching GraphQL type definitions — nested objects become their own types."
      />
      <ToolLab
        inputLabel="JSON"
        outputLabel="GraphQL SDL"
        placeholder={`{\n  "id": 1,\n  "name": "Ada",\n  "address": { "city": "London" }\n}`}
        live
        recalcKey={name}
        settingsSlot={<TextField label="Root type name" value={name} onChange={setName} width="w-28" />}
        emptyHint="Paste JSON above — the GraphQL types update automatically."
        onRun={(input) => jsonToGraphQL(input, name)}
      />
    </div>
  );
}
