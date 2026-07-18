"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { SelectField } from "@/components/tools/FormFields";

function tokenizeCurl(cmd: string): string[] {
  const tokens: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cmd))) tokens.push(m[1] ?? m[2] ?? m[3]);
  return tokens;
}

function curlConvert(input: string, target: "fetch" | "axios"): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Paste a curl command");
  const tokens = tokenizeCurl(trimmed.replace(/^curl\s+/, "").replace(/\\\n/g, " "));
  let url = "";
  let method = "GET";
  const headers: Record<string, string> = {};
  let body: string | null = null;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "-X" || t === "--request") {
      method = tokens[++i];
    } else if (t === "-H" || t === "--header") {
      const raw = tokens[++i] ?? "";
      const sep = raw.indexOf(":");
      if (sep > -1) headers[raw.slice(0, sep).trim()] = raw.slice(sep + 1).trim();
    } else if (t === "-d" || t === "--data" || t === "--data-raw" || t === "--data-binary" || t === "--data-urlencode") {
      body = tokens[++i];
      if (method === "GET") method = "POST";
    } else if (t === "-u" || t === "--user") {
      headers["Authorization"] = `Basic ${tokens[++i]}`;
    } else if (t.startsWith("-")) {
      // skip unknown flags
    } else if (!url) {
      url = t;
    }
  }
  if (!url) throw new Error("Couldn't find a URL in that curl command");

  if (target === "fetch") {
    const opts: string[] = [`method: "${method}"`];
    if (Object.keys(headers).length) {
      opts.push(`headers: ${JSON.stringify(headers, null, 2).split("\n").join("\n  ")}`);
    }
    if (body) opts.push(`body: ${JSON.stringify(body)}`);
    return `fetch("${url}", {\n  ${opts.join(",\n  ")}\n})\n  .then((res) => res.json())\n  .then((data) => console.log(data));`;
  }

  const axiosParts: string[] = [];
  if (Object.keys(headers).length) {
    axiosParts.push(`headers: ${JSON.stringify(headers, null, 2).split("\n").join("\n  ")}`);
  }
  let dataArg = "";
  if (body) {
    try {
      dataArg = `, ${JSON.stringify(JSON.parse(body))}`;
    } catch {
      dataArg = `, ${JSON.stringify(body)}`;
    }
  }
  const cfg = axiosParts.length ? `, {\n  ${axiosParts.join(",\n  ")}\n}` : "";
  return `axios.${method.toLowerCase()}("${url}"${dataArg}${cfg})\n  .then((res) => console.log(res.data));`;
}

export default function CurlConverterPage() {
  const [target, setTarget] = useState<"fetch" | "axios">("fetch");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="sh"
        title="cURL ⇄ Fetch/Axios Converter"
        desc="Paste a curl command and get equivalent JavaScript request code — no server round trip."
      />
      <ToolLab
        inputLabel="curl command"
        outputLabel={target === "fetch" ? "Fetch code" : "Axios code"}
        placeholder={`curl -X POST https://api.example.com/users \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"Ada"}'`}
        live
        recalcKey={target}
        settingsSlot={
          <SelectField
            label="Target"
            value={target}
            onChange={(v) => setTarget(v as "fetch" | "axios")}
            options={[
              { value: "fetch", label: "Fetch" },
              { value: "axios", label: "Axios" },
            ]}
          />
        }
        emptyHint="Paste a curl command above — the JS code updates automatically."
        onRun={(input) => curlConvert(input, target)}
      />
    </div>
  );
}
