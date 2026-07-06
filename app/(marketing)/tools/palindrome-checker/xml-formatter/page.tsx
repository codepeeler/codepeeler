"use client";

import { useState } from "react";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", preserveOrder: true });
const prettyBuilder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  preserveOrder: true,
  format: true,
  indentBy: "  ",
});
const minBuilder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: "@_", preserveOrder: true, format: false });

function runXml(input: string, mode: string): string {
  const valid = XMLValidator.validate(input);
  if (valid !== true) {
    throw new Error(`${valid.err.msg} (line ${valid.err.line})`);
  }
  const parsed = parser.parse(input);
  return mode === "format" ? prettyBuilder.build(parsed) : minBuilder.build(parsed);
}

export default function XmlFormatterPage() {
  const [mode, setMode] = useState("format");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="</>"
        title="XML Formatter"
        desc="Format, validate, and minify XML — real XML parsing under the hood, so malformed markup is caught, not just reflowed."
      />
      <ToolLab
        inputLabel="Raw XML"
        outputLabel={mode === "format" ? "Formatted XML" : "Minified XML"}
        placeholder={'<root><item id="1">Hello</item></root>'}
        modes={[
          { value: "format", label: "Format" },
          { value: "minify", label: "Minify" },
        ]}
        mode={mode}
        onModeChange={setMode}
        recalcKey={mode}
        live
        emptyHint="Paste XML above — it's validated and formatted automatically."
        onRun={(input) => runXml(input, mode)}
      />
    </div>
  );
}
