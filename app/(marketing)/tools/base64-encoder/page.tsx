"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

export default function Base64EncoderPage() {
  const [mode, setMode] = useState("encode");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="encode"
        badge="64"
        title="Base64 Encode/Decode"
        desc="Convert text to and from Base64 — Unicode safe, runs entirely in your browser."
      />
      <ToolLab
        inputLabel={mode === "encode" ? "Text" : "Base64"}
        outputLabel={mode === "encode" ? "Base64" : "Text"}
        placeholder={mode === "encode" ? "Type or paste text..." : "Paste Base64 to decode..."}
        modes={[
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        emptyHint="Enter text above, choose a mode — the result updates automatically."
        onRun={(input) =>
          mode === "encode"
            ? btoa(unescape(encodeURIComponent(input)))
            : decodeURIComponent(escape(atob(input.trim())))
        }
      />
    </div>
  );
}
