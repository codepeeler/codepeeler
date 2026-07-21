"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function urlParse(input: string): string {
  const raw = input.trim();
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Enter a full URL, e.g. https://example.com/path?a=1");
  }
  const lines = [
    `Protocol:  ${url.protocol}`,
    `Host:      ${url.hostname}`,
    `Port:      ${url.port || "(default)"}`,
    `Path:      ${url.pathname}`,
    `Query:     ${url.search || "(none)"}`,
    `Hash:      ${url.hash || "(none)"}`,
    `Origin:    ${url.origin}`,
  ];
  if (url.search) {
    lines.push("", "Query params:");
    url.searchParams.forEach((v, k) => lines.push(`  ${k} = ${v}`));
  }
  return lines.join("\n");
}

export default function UrlParserPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="URL"
        title="URL Parser"
        desc="Break a URL down into protocol, host, path, query params and hash."
      />
      <ToolLab
        inputLabel="URL"
        outputLabel="Breakdown"
        placeholder="e.g. https://example.com/path?a=1&b=2#section"
        live
        monospaceInput={false}
        emptyHint="Enter a URL above — the breakdown updates automatically."
        onRun={(input) => urlParse(input)}
      />
    </div>
  );
}
