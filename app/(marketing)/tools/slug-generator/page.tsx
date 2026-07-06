"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { CheckboxOption, SelectField } from "@/components/tools/FormFields";

function slugify(input: string, separator: string, lowercase: boolean): string {
  let s = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .trim()
    .replace(/[^a-zA-Z0-9\s-_]/g, "")
    .replace(/[\s_-]+/g, separator);
  s = s.replace(new RegExp(`^\\${separator}+|\\${separator}+$`, "g"), "");
  return lowercase ? s.toLowerCase() : s;
}

export default function SlugGeneratorPage() {
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="/-/"
        title="Slug Generator"
        desc="Turn any title or sentence into a clean, URL-safe slug — strips accents, punctuation, and extra spaces."
      />
      <ToolLab
        inputLabel="Text"
        outputLabel="Slug"
        placeholder="10 Best Développement Tools for 2026!"
        live
        recalcKey={`${separator}-${lowercase}`}
        emptyHint="Type a title above to generate its slug."
        monospaceInput={false}
        settingsSlot={
          <>
            <SelectField
              label="Separator"
              value={separator}
              onChange={setSeparator}
              options={[
                { value: "-", label: "Hyphen (-)" },
                { value: "_", label: "Underscore (_)" },
              ]}
            />
            <CheckboxOption label="Lowercase" checked={lowercase} onChange={setLowercase} />
          </>
        }
        onRun={(input) => slugify(input, separator, lowercase)}
      />
    </div>
  );
}
