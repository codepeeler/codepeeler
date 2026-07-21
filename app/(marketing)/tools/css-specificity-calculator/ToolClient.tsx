"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function cssSpecificity(input: string): string {
  const selectors = input.split(",").map((s) => s.trim()).filter(Boolean);
  if (!selectors.length) throw new Error("Enter one or more CSS selectors");
  const lines = selectors.map((sel) => {
    const idCount = (sel.match(/#[a-zA-Z0-9_-]+/g) || []).length;
    const classCount =
      (sel.match(/\.[a-zA-Z0-9_-]+/g) || []).length +
      (sel.match(/\[[^\]]+\]/g) || []).length +
      (sel.match(/:(?!:)[a-zA-Z-]+(\([^)]*\))?/g) || []).filter((p) => !/^:(before|after)$/.test(p)).length;
    const stripped = sel
      .replace(/#[a-zA-Z0-9_-]+/g, "")
      .replace(/\.[a-zA-Z0-9_-]+/g, "")
      .replace(/\[[^\]]+\]/g, "")
      .replace(/:[a-zA-Z-]+(\([^)]*\))?/g, "");
    const typeCount = (stripped.match(/(^|[\s>+~])[a-zA-Z][a-zA-Z0-9-]*/g) || []).length;
    return `${sel.padEnd(30)} → (${idCount}, ${classCount}, ${typeCount})`;
  });
  return lines.join("\n");
}

export default function CssSpecificityCalculatorPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="css"
        title="CSS Specificity Calculator"
        desc="Enter one or more CSS selectors (comma-separated) to see their specificity as (IDs, classes, elements)."
      />
      <ToolLab
        inputLabel="CSS selectors"
        outputLabel="Specificity"
        placeholder={`#nav .item a:hover, .card > p, body`}
        live
        emptyHint="Enter selectors above, separated by commas — the specificity updates automatically."
        onRun={(input) => cssSpecificity(input)}
      />
    </div>
  );
}
