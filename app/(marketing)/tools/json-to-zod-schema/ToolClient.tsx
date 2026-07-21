"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { TextField } from "@/components/tools/FormFields";

function jsonToZod(input: string, rootName: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON");
  }

  function zodFor(value: unknown): string {
    if (value === null) return "z.null()";
    if (Array.isArray(value)) {
      if (value.length === 0) return "z.array(z.unknown())";
      return `z.array(${zodFor(value[0])})`;
    }
    const t = typeof value;
    if (t === "string") return "z.string()";
    if (t === "number") return "z.number()";
    if (t === "boolean") return "z.boolean()";
    if (t === "object") {
      const entries = Object.entries(value as Record<string, unknown>).map(([k, v]) => {
        const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : `"${k}"`;
        return `  ${safeKey}: ${zodFor(v)},`;
      });
      return `z.object({\n${entries.join("\n")}\n})`;
    }
    return "z.unknown()";
  }

  const name = (rootName || "schema").replace(/[^a-zA-Z0-9_]/g, "") || "schema";
  const typeName = name.charAt(0).toUpperCase() + name.slice(1);
  return `import { z } from "zod";\n\nexport const ${name} = ${zodFor(data)};\n\nexport type ${typeName} = z.infer<typeof ${name}>;`;
}

export default function JsonToZodSchemaPage() {
  const [name, setName] = useState("schema");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="zod"
        title="JSON to Zod Schema"
        desc="Paste a JSON sample and generate a matching Zod schema, ready to import and validate with."
      />
      <ToolLab
        inputLabel="JSON"
        outputLabel="Zod schema"
        placeholder={`{\n  "id": 1,\n  "name": "Ada",\n  "tags": ["admin", "beta"]\n}`}
        live
        recalcKey={name}
        settingsSlot={<TextField label="Schema name" value={name} onChange={setName} width="w-28" />}
        emptyHint="Paste JSON above — the Zod schema updates automatically."
        onRun={(input) => jsonToZod(input, name)}
      />
    </div>
  );
}
