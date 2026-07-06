"use client";

import yaml from "js-yaml";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function runYaml(input: string): string {
  try {
    const parsed = yaml.load(input);
    return yaml.dump(parsed, { indent: 2, lineWidth: -1 });
  } catch (e) {
    if (e instanceof yaml.YAMLException) {
      throw new Error(`${e.reason} (line ${e.mark?.line != null ? e.mark.line + 1 : "?"}, col ${e.mark?.column != null ? e.mark.column + 1 : "?"})`);
    }
    throw e;
  }
}

export default function YamlLinterPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="Y"
        title="YAML Formatter & Linter"
        desc="Validate and re-indent YAML with precise line/column error reporting, powered by js-yaml."
      />
      <ToolLab
        inputLabel="Raw YAML"
        outputLabel="Formatted YAML"
        placeholder={"name: CodePeeler\nversion: 1\ntags:\n  - dev\n  - tools"}
        live
        emptyHint="Paste YAML above — it's validated and re-formatted automatically."
        monospaceInput
        onRun={(input) => runYaml(input)}
      />
    </div>
  );
}
