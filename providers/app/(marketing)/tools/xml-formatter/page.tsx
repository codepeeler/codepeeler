"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function formatXML(xml: string): string {
  const trimmed = xml.replace(/>\s*</g, "><").trim();
  if (!trimmed) return "";
  const PAD = "  ";
  let pad = 0;
  let out = "";
  trimmed.split(/(?=<)/).forEach((chunk) => {
    if (!chunk) return;
    const isClosing = /^<\/\w/.test(chunk);
    const isSelfClosing = /\/>\s*$/.test(chunk) || /^<\?/.test(chunk) || /^<!--/.test(chunk);
    if (isClosing) pad = Math.max(0, pad - 1);
    out += PAD.repeat(pad) + chunk.trim() + "\n";
    if (!isClosing && !isSelfClosing && /^<\w/.test(chunk)) pad += 1;
  });
  return out.trim();
}

export default function XmlFormatterPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="</>"
        title="XML Formatter"
        desc="Pretty-print minified or single-line XML into a readable, correctly indented document."
      />
      <ToolLab
        inputLabel="Raw XML"
        outputLabel="Formatted XML"
        placeholder={'<root><item id="1">Hello</item></root>'}
        live
        emptyHint="Paste XML above to have it indented automatically."
        onRun={(input) => formatXML(input)}
      />
    </div>
  );
}
