"use client";

import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import FieldBox from "@/components/tools/FieldBox";
import { PanelToolbar, PanelBody, PanelFooter } from "@/components/tools/PanelParts";
import { OutlineButton } from "@/components/tools/Buttons";

const SAMPLE = `# CodePeeler

A fast **markdown** previewer with _live_ rendering.

- Supports lists
- \`inline code\`
- [links](https://example.com)

\`\`\`js
console.log("hello world");
\`\`\`

> Blockquotes work too.
`;

marked.setOptions({ gfm: true, breaks: true });

export default function MarkdownPreviewerPage() {
  const [input, setInput] = useState("");
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await marked.parse(input);
      const clean = DOMPurify.sanitize(raw);
      if (!cancelled) setHtml(clean);
    })();
    return () => {
      cancelled = true;
    };
  }, [input]);

  const wordCount = useMemo(() => (input.trim() ? input.trim().split(/\s+/).length : 0), [input]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="M↓"
        title="Markdown Previewer"
        desc="Write GitHub-flavored Markdown and see a sanitized live preview side by side — powered by marked + DOMPurify."
      />

      <ToolPanel>
        <PanelToolbar>
          <OutlineButton onClick={() => setInput(SAMPLE)}>Load sample</OutlineButton>
          <OutlineButton onClick={() => setInput("")}>Clear</OutlineButton>
        </PanelToolbar>

        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <FieldBox label="Markdown" height="420px">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder="# Hello world"
              className="h-full w-full resize-none bg-transparent p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.6] text-[var(--text)] placeholder:text-[var(--text-faint)]"
            />
          </FieldBox>
          <FieldBox label="Preview" height="420px">
            <div
              className="max-w-none p-3.5 text-[13.5px] leading-[1.6] text-[var(--text)] [&_a]:text-[var(--primary)] [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--border)] [&_blockquote]:pl-3 [&_blockquote]:text-[var(--text-dim)] [&_code]:rounded [&_code]:bg-[var(--card-hover)] [&_code]:px-1 [&_code]:py-0.5 [&_h1]:text-[22px] [&_h1]:font-bold [&_h2]:text-[18px] [&_h2]:font-semibold [&_li]:ml-4 [&_p]:mb-2.5 [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:bg-[var(--card-hover)] [&_pre]:p-3"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </FieldBox>
        </PanelBody>

        <PanelFooter>
          {wordCount} word{wordCount === 1 ? "" : "s"}
        </PanelFooter>
      </ToolPanel>
    </div>
  );
}
