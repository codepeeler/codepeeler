"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

export default function UrlEncoderPage() {
  const [mode, setMode] = useState("encode");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="%"
        title="URL Encode/Decode"
        desc="Percent-encode text for safe use in URLs, or decode a percent-encoded string back to plain text."
      />
      <ToolLab
        inputLabel={mode === "encode" ? "Text" : "Encoded URL"}
        outputLabel={mode === "encode" ? "Encoded URL" : "Text"}
        placeholder={mode === "encode" ? "https://example.com/search?q=hello world" : "hello%20world"}
        modes={[
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        emptyHint="Enter text above, choose a mode — the result updates automatically."
        onRun={(input) => (mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input))}
      />
    </div>
  );
}
