"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { SelectField, TextField, CheckboxOption } from "@/components/tools/FormFields";

type CommitType = "feat" | "fix" | "docs" | "style" | "refactor" | "test" | "chore" | "perf";

function formatCommitMessage(input: string, type: CommitType, scope: string, breaking: boolean): string {
  if (!input.trim()) throw new Error("Enter a short commit description");
  const desc = input.trim().replace(/\.$/, "");
  const scopePart = scope.trim() ? `(${scope.trim()})` : "";
  const bang = breaking ? "!" : "";
  return `${type}${scopePart}${bang}: ${desc}`;
}

export default function CommitMessageFormatterPage() {
  const [type, setType] = useState<CommitType>("feat");
  const [scope, setScope] = useState("");
  const [breaking, setBreaking] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="git"
        title="Commit Message Formatter"
        desc="Build a Conventional Commits message from a short description, type, and optional scope."
      />
      <ToolLab
        inputLabel="Description"
        outputLabel="Commit message"
        placeholder="add dark mode toggle to settings page"
        live
        recalcKey={`${type}-${scope}-${breaking}`}
        settingsSlot={
          <>
            <SelectField
              label="Type"
              value={type}
              onChange={(v) => setType(v as CommitType)}
              options={["feat", "fix", "docs", "style", "refactor", "test", "chore", "perf"].map((t) => ({ value: t, label: t }))}
            />
            <TextField label="Scope (optional)" value={scope} onChange={setScope} width="w-32" />
            <CheckboxOption label="Breaking change" checked={breaking} onChange={setBreaking} />
          </>
        }
        emptyHint="Enter a short description above — the commit message updates automatically."
        onRun={(input) => formatCommitMessage(input, type, scope, breaking)}
      />
    </div>
  );
}
