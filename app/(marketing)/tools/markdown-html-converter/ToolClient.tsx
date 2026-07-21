"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

async function markdownToHtmlConvert(input: string): Promise<string> {
  if (!input.trim()) throw new Error("Enter some Markdown");
  const { marked } = await import("marked");
  marked.setOptions({ gfm: true, breaks: true });
  return await marked.parse(input);
}

function htmlToMarkdownConvert(input: string): string {
  if (!input.trim()) throw new Error("Enter some HTML");
  let s = input;
  s = s.replace(/<!--([\s\S]*?)-->/g, "");
  s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n");
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n");
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n");
  s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n");
  s = s.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n##### $1\n");
  s = s.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n###### $1\n");
  s = s.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, "**$2**");
  s = s.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, "_$2_");
  s = s.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_m: string, c: string) => `\n\`\`\`\n${c.replace(/<[^>]+>/g, "")}\n\`\`\`\n`);
  s = s.replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`");
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m: string, c: string) =>
    c
      .trim()
      .split("\n")
      .map((l: string) => `> ${l.trim()}`)
      .join("\n") + "\n"
  );
  s = s.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  s = s.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  s = s.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, "![$1]($2)");
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
  s = s.replace(/<\/(ul|ol)>/gi, "\n");
  s = s.replace(/<(ul|ol)[^>]*>/gi, "\n");
  s = s.replace(/<br\s*\/?>/gi, "  \n");
  s = s.replace(/<\/p>/gi, "\n\n");
  s = s.replace(/<p[^>]*>/gi, "");
  s = s.replace(/<hr\s*\/?>/gi, "\n---\n");
  s = s.replace(/<[^>]+>/g, "");
  s = s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  s = s.replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

export default function MarkdownHtmlConverterPage() {
  const [mode, setMode] = useState("toHtml");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="M↔H"
        title="Markdown ⇄ HTML Converter"
        desc="Convert Markdown source to HTML markup, or HTML back to Markdown — runs entirely in your browser."
      />
      <ToolLab
        inputLabel={mode === "toHtml" ? "Markdown" : "HTML"}
        outputLabel={mode === "toHtml" ? "HTML" : "Markdown"}
        placeholder={mode === "toHtml" ? "# Hello world\n\nSome **bold** text." : "<h1>Hello world</h1>\n<p>Some <strong>bold</strong> text.</p>"}
        modes={[
          { value: "toHtml", label: "Markdown → HTML" },
          { value: "toMarkdown", label: "HTML → Markdown" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Enter content above, choose a direction — the result updates automatically."
        onRun={(input) => (mode === "toHtml" ? markdownToHtmlConvert(input) : htmlToMarkdownConvert(input))}
      />
    </div>
  );
}
