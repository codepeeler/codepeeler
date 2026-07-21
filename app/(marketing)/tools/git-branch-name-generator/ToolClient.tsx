"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { SelectField } from "@/components/tools/FormFields";

type BranchType = "feature" | "fix" | "chore" | "hotfix" | "release" | "docs";

function gitBranchGenerate(input: string, type: BranchType): string {
  if (!input.trim()) throw new Error("Enter a short description or ticket title");
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");
  return `${type}/${slug}`;
}

export default function GitBranchNameGeneratorPage() {
  const [type, setType] = useState<BranchType>("feature");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="⎇"
        title="Git Branch Name Generator"
        desc="Turn a ticket title or short description into a clean, conventional branch name."
      />
      <ToolLab
        inputLabel="Description or ticket title"
        outputLabel="Branch name"
        placeholder="Fix login redirect bug JIRA-123"
        live
        recalcKey={type}
        settingsSlot={
          <SelectField
            label="Type"
            value={type}
            onChange={(v) => setType(v as BranchType)}
            options={[
              { value: "feature", label: "feature" },
              { value: "fix", label: "fix" },
              { value: "chore", label: "chore" },
              { value: "hotfix", label: "hotfix" },
              { value: "release", label: "release" },
              { value: "docs", label: "docs" },
            ]}
          />
        }
        emptyHint="Enter a description above — the branch name updates automatically."
        onRun={(input) => gitBranchGenerate(input, type)}
      />
    </div>
  );
}
