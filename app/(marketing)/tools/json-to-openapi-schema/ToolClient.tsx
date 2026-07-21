"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function jsonToOpenApiSchema(input: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON");
  }

  function schemaFor(value: unknown): Record<string, unknown> {
    if (value === null) return { type: "string", nullable: true };
    if (Array.isArray(value)) return { type: "array", items: value.length ? schemaFor(value[0]) : {} };
    const t = typeof value;
    if (t === "string") return { type: "string", example: value };
    if (t === "boolean") return { type: "boolean", example: value };
    if (t === "number") return { type: Number.isInteger(value) ? "integer" : "number", example: value };
    if (t === "object") {
      const properties: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) properties[k] = schemaFor(v);
      return { type: "object", properties, required: Object.keys(value as object) };
    }
    return { type: "string" };
  }

  return JSON.stringify(schemaFor(data), null, 2);
}

export default function JsonToOpenApiSchemaPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="oapi"
        title="JSON to OpenAPI Schema"
        desc="Paste a JSON sample and generate an OpenAPI 3.0 schema fragment, ready to drop into your API docs."
      />
      <ToolLab
        inputLabel="JSON"
        outputLabel="OpenAPI schema"
        placeholder={`{\n  "id": 1,\n  "name": "Ada",\n  "active": true\n}`}
        live
        emptyHint="Paste JSON above — the OpenAPI schema updates automatically."
        onRun={(input) => jsonToOpenApiSchema(input)}
      />
    </div>
  );
}
