"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function toTitleCase(input: string) {
  return input.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase());
}

function toSentenceCase(input: string) {
  return input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}

export default function CaseConverterPage() {
  const [mode, setMode] = useState("upper");

  const labels: Record<string, string> = {
    upper: "UPPERCASE",
    lower: "lowercase",
    title: "Title Case",
    sentence: "Sentence case",
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="AA"
        title="Case Converter"
        desc="Convert text to UPPERCASE, lowercase, Title Case, or Sentence case in one click."
      />
      <ToolLab
        inputLabel="Text"
        outputLabel={labels[mode]}
        placeholder="Type or paste text..."
        modes={[
          { value: "upper", label: "UPPERCASE" },
          { value: "lower", label: "lowercase" },
          { value: "title", label: "Title Case" },
          { value: "sentence", label: "Sentence case" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        emptyHint="Enter text above — the converted result updates automatically."
        onRun={(input) => {
          switch (mode) {
            case "upper":
              return input.toUpperCase();
            case "lower":
              return input.toLowerCase();
            case "title":
              return toTitleCase(input);
            case "sentence":
              return toSentenceCase(input);
            default:
              return input;
          }
        }}
      />
    </div>
  );
}
