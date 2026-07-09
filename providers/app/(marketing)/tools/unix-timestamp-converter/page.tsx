"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

type Direction = "toDate" | "toTimestamp";

function unixTimestampConvert(input: string, direction: Direction): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter a timestamp or date");

  if (direction === "toDate") {
    if (!/^-?\d+$/.test(trimmed)) throw new Error("Enter a Unix timestamp (integer seconds or milliseconds)");
    const num = Number(trimmed);
    const ms = Math.abs(num) > 1e12 ? num : num * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) throw new Error("That number doesn't map to a valid date");
    return [
      `ISO 8601:   ${d.toISOString()}`,
      `UTC:        ${d.toUTCString()}`,
      `Local:      ${d.toString()}`,
      `Unix (s):   ${Math.floor(d.getTime() / 1000)}`,
      `Unix (ms):  ${d.getTime()}`,
    ].join("\n");
  }

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) throw new Error("Enter a valid date (e.g. 2026-07-08T12:00:00Z)");
  return [
    `Unix (s):   ${Math.floor(d.getTime() / 1000)}`,
    `Unix (ms):  ${d.getTime()}`,
    `ISO 8601:   ${d.toISOString()}`,
    `UTC:        ${d.toUTCString()}`,
  ].join("\n");
}

export default function UnixTimestampConverterPage() {
  const [direction, setDirection] = useState<Direction>("toDate");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="⏱"
        title="Unix Timestamp Converter"
        desc="Convert between Unix time (seconds or milliseconds) and human-readable dates — runs entirely in your browser."
      />
      <ToolLab
        inputLabel={direction === "toDate" ? "Unix Timestamp" : "Date"}
        outputLabel={direction === "toDate" ? "Readable Date" : "Unix Timestamp"}
        placeholder={direction === "toDate" ? "e.g. 1751980800" : "e.g. 2026-07-08T12:00:00Z"}
        modes={[
          { value: "toDate", label: "Timestamp → Date" },
          { value: "toTimestamp", label: "Date → Timestamp" },
        ]}
        mode={direction}
        onModeChange={(m) => setDirection(m as Direction)}
        live
        recalcKey={direction}
        emptyHint="Enter a value above — the conversion updates automatically."
        onRun={(input) => unixTimestampConvert(input, direction)}
      />
    </div>
  );
}
