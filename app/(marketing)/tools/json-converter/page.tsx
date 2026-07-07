"use client";

import { useState } from "react";
import * as yaml from "js-yaml";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

const MODES = [
  { value: "json-yaml", label: "JSON → YAML" },
  { value: "yaml-json", label: "YAML → JSON" },
  { value: "json-xml", label: "JSON → XML" },
  { value: "xml-json", label: "XML → JSON" },
];

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
const xmlBuilder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: "@_", format: true, indentBy: "  " });

const PLACEHOLDERS: Record<string, string> = {
  "json-yaml": '{\n  "name": "CodePeeler",\n  "tags": ["dev", "tools"]\n}',
  "yaml-json": "name: CodePeeler\ntags:\n  - dev\n  - tools",
  "json-xml": '{\n  "root": {\n    "item": [{ "id": "1", "#text": "Hello" }]\n  }\n}',
  "xml-json": '<root><item id="1">Hello</item></root>',
};

export default function JsonConverterPage() {
  const [mode, setMode] = useState("json-yaml");

  const run = (input: string): string => {
    switch (mode) {
      case "json-yaml":
        return yaml.dump(JSON.parse(input));
      case "yaml-json":
        return JSON.stringify(yaml.load(input), null, 2);
      case "json-xml":
        return xmlBuilder.build(JSON.parse(input));
      case "xml-json":
        return JSON.stringify(xmlParser.parse(input), null, 2);
      default:
        return input;
    }
  };

  const [inLabel, outLabel] = mode.split("-").map((s) => s.toUpperCase());

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="⇄"
        title="JSON / YAML / XML Converter"
        desc="Convert between JSON, YAML, and XML in either direction — powered by js-yaml and fast-xml-parser."
      />
      <ToolLab
        inputLabel={inLabel}
        outputLabel={outLabel}
        placeholder={PLACEHOLDERS[mode]}
        modes={MODES}
        mode={mode}
        onModeChange={setMode}
        recalcKey={mode}
        live
        emptyHint="Paste content above matching the selected input format."
        onRun={(input) => run(input)}
      />
    </div>
  );
}
