"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function svgToDataUriBase64(input: string): string {
  if (!input.includes("<svg")) throw new Error("Paste raw SVG markup");
  const b64 = btoa(unescape(encodeURIComponent(input.trim())));
  return `background-image: url("data:image/svg+xml;base64,${b64}");`;
}

function svgToDataUriUrl(input: string): string {
  if (!input.includes("<svg")) throw new Error("Paste raw SVG markup");
  const cleaned = input.trim().replace(/\s+/g, " ");
  const encoded = cleaned
    .replace(/"/g, "'")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/&/g, "%26");
  return `background-image: url("data:image/svg+xml,${encoded}");`;
}

export default function SvgToDataUriPage() {
  const [mode, setMode] = useState("base64");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="svg"
        title="SVG to CSS Data URI"
        desc="Convert raw SVG markup into a CSS-ready data URI you can drop straight into background-image."
      />
      <ToolLab
        inputLabel="SVG markup"
        outputLabel="CSS"
        placeholder={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`}
        modes={[
          { value: "base64", label: "Base64" },
          { value: "url", label: "URL-encoded" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Paste SVG markup above — the CSS data URI updates automatically."
        onRun={(input) => (mode === "base64" ? svgToDataUriBase64(input) : svgToDataUriUrl(input))}
      />
    </div>
  );
}
