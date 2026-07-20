"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function markdownToSlack(input: string): string {
  if (!input.trim()) throw new Error("Enter Markdown text");
  let s = input;
  s = s.replace(/\*\*(.+?)\*\*/g, "*$1*");
  s = s.replace(/__(.+?)__/g, "_$1_");
  s = s.replace(/~~(.+?)~~/g, "~$1~");
  s = s.replace(/\[(.+?)\]\((.+?)\)/g, "<$2|$1>");
  s = s.replace(/^#{1,6}\s+(.+)$/gm, "*$1*");
  s = s.replace(/^[-*]\s+(.+)$/gm, "• $1");
  return s;
}

function markdownToDiscord(input: string): string {
  if (!input.trim()) throw new Error("Enter Markdown text");
  let s = input;
  s = s.replace(/^#{1,6}\s+(.+)$/gm, "**$1**");
  s = s.replace(/\[(.+?)\]\((.+?)\)/g, "$1 (<$2>)");
  return s;
}

export default function MarkdownToSlackDiscordPage() {
  const [mode, setMode] = useState("slack");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="#"
        title="Markdown → Slack/Discord Converter"
        desc="Slack and Discord use their own flavors of Markdown — convert standard Markdown to match either one."
      />
      <ToolLab
        inputLabel="Markdown"
        outputLabel={mode === "slack" ? "Slack format" : "Discord format"}
        placeholder={`# Heading\n\nSome **bold** and _italic_ text with a [link](https://example.com).`}
        modes={[
          { value: "slack", label: "Slack" },
          { value: "discord", label: "Discord" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Enter Markdown above, choose a target — the result updates automatically."
        onRun={(input) => (mode === "slack" ? markdownToSlack(input) : markdownToDiscord(input))}
      />
    </div>
  );
}
