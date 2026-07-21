"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";
import { SelectField } from "@/components/tools/FormFields";

type CodeLang = "javascript" | "python" | "java" | "go";

function parseRegexInput(input: string): { pattern: string; flags: string } {
  const trimmed = input.trim();
  const m = trimmed.match(/^\/(.*)\/([a-z]*)$/s);
  if (m) return { pattern: m[1], flags: m[2] };
  return { pattern: trimmed, flags: "" };
}

function regexToCode(input: string, lang: CodeLang): string {
  if (!input.trim()) throw new Error("Enter a regex pattern");
  const { pattern, flags } = parseRegexInput(input);
  try {
    new RegExp(pattern, flags.replace(/[^gimsuy]/g, ""));
  } catch (e) {
    throw new Error("Invalid regex: " + (e instanceof Error ? e.message : ""));
  }

  if (lang === "javascript") {
    return `const re = /${pattern}/${flags};\n\nconst match = "your string".match(re);\nconsole.log(match);`;
  }
  if (lang === "python") {
    const pyFlags = flags.includes("i") ? ", re.IGNORECASE" : "";
    return `import re\n\npattern = re.compile(r"${pattern}"${pyFlags})\nmatch = pattern.search("your string")\nprint(match)`;
  }
  if (lang === "java") {
    return `import java.util.regex.*;\n\nPattern pattern = Pattern.compile("${pattern.replace(/\\/g, "\\\\")}");\nMatcher matcher = pattern.matcher("your string");\nif (matcher.find()) {\n    System.out.println(matcher.group());\n}`;
  }
  return `package main\n\nimport (\n\t"fmt"\n\t"regexp"\n)\n\nfunc main() {\n\tre := regexp.MustCompile(\`${pattern}\`)\n\tmatch := re.FindString("your string")\n\tfmt.Println(match)\n}`;
}

export default function RegexToCodeSnippetPage() {
  const [lang, setLang] = useState<CodeLang>("javascript");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="re"
        title="Regex to Code Snippet"
        desc="Paste a regex pattern and get a ready-to-use code snippet in JavaScript, Python, Java, or Go."
      />
      <ToolLab
        inputLabel="Regex pattern"
        outputLabel="Code"
        placeholder="/^[\\w.+-]+@[\\w-]+\\.[a-z]{2,}$/i"
        live
        recalcKey={lang}
        settingsSlot={
          <SelectField
            label="Language"
            value={lang}
            onChange={(v) => setLang(v as CodeLang)}
            options={[
              { value: "javascript", label: "JavaScript" },
              { value: "python", label: "Python" },
              { value: "java", label: "Java" },
              { value: "go", label: "Go" },
            ]}
          />
        }
        emptyHint="Enter a regex above — the code snippet updates automatically."
        onRun={(input) => regexToCode(input, lang)}
      />
    </div>
  );
}
