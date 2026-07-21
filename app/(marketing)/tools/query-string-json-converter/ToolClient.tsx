"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type Direction = "toJson" | "toQuery";

function queryStringToJson(input: string): string {
  const raw = input.trim().replace(/^\?/, "");
  if (!raw) throw new Error("Enter a query string, e.g. a=1&b=two");
  const params = new URLSearchParams(raw);
  const obj: Record<string, string | string[]> = {};
  params.forEach((v, k) => {
    if (obj[k] === undefined) obj[k] = v;
    else obj[k] = Array.isArray(obj[k]) ? [...(obj[k] as string[]), v] : [obj[k] as string, v];
  });
  return JSON.stringify(obj, null, 2);
}

function jsonToQueryString(input: string): string {
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(input);
  } catch {
    throw new Error('Enter valid flat JSON, e.g. {"a":1,"b":"two"}');
  }
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) v.forEach((item) => params.append(k, String(item)));
    else params.append(k, String(v));
  }
  return params.toString();
}

export default function QueryStringJsonConverterPage() {
  const [mode, setMode] = useState<Direction>("toJson");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="?="
        title="Query String ⇄ JSON Converter"
        desc="Convert a URL query string to structured JSON, or flat JSON back into a query string."
      />
      <ToolLab
        inputLabel={mode === "toJson" ? "Query String" : "JSON"}
        outputLabel={mode === "toJson" ? "JSON" : "Query String"}
        placeholder={mode === "toJson" ? "e.g. a=1&b=two&c=3" : 'e.g. {"a":1,"b":"two"}'}
        modes={[
          { value: "toJson", label: "Query → JSON" },
          { value: "toQuery", label: "JSON → Query" },
        ]}
        mode={mode}
        onModeChange={(m) => setMode(m as Direction)}
        live
        recalcKey={mode}
        emptyHint="Enter a value above, choose a direction — the result updates automatically."
        onRun={(input) => (mode === "toJson" ? queryStringToJson(input) : jsonToQueryString(input))}
      />
    </div>
  );
}
