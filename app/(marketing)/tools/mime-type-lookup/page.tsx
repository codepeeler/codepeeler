"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

const MIME_MAP: Record<string, string> = {
  html: "text/html", htm: "text/html", css: "text/css", js: "application/javascript", json: "application/json",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", webp: "image/webp",
  pdf: "application/pdf", zip: "application/zip", txt: "text/plain", csv: "text/csv", xml: "application/xml",
  mp3: "audio/mpeg", mp4: "video/mp4", wav: "audio/wav", woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf",
  doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  gz: "application/gzip", tar: "application/x-tar", ico: "image/x-icon", md: "text/markdown", yaml: "application/x-yaml", yml: "application/x-yaml",
};

function mimeExtToType(input: string): string {
  const ext = input.trim().replace(/^\./, "").toLowerCase();
  if (!ext) throw new Error("Enter a file extension, e.g. json");
  const type = MIME_MAP[ext];
  if (!type) throw new Error(`No known MIME type for ".${ext}"`);
  return type;
}

function mimeTypeToExt(input: string): string {
  const type = input.trim().toLowerCase();
  if (!type) throw new Error("Enter a MIME type, e.g. application/json");
  const matches = Object.entries(MIME_MAP)
    .filter(([, v]) => v === type)
    .map(([k]) => `.${k}`);
  if (!matches.length) throw new Error(`No known extension for "${type}"`);
  return matches.join(", ");
}

export default function MimeTypeLookupPage() {
  const [mode, setMode] = useState("extToType");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="mime"
        title="MIME Type ⇄ Extension Lookup"
        desc="Look up the MIME type for a file extension, or find file extensions for a MIME type."
      />
      <ToolLab
        inputLabel={mode === "extToType" ? "Extension" : "MIME type"}
        outputLabel={mode === "extToType" ? "MIME type" : "Extension(s)"}
        placeholder={mode === "extToType" ? "json" : "application/json"}
        modes={[
          { value: "extToType", label: "Extension → Type" },
          { value: "typeToExt", label: "Type → Extension" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Enter a value above, choose a direction — the result updates automatically."
        onRun={(input) => (mode === "extToType" ? mimeExtToType(input) : mimeTypeToExt(input))}
      />
    </div>
  );
}
