"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function explainRegexToken(token: string): string {
  const explanations: Record<string, string> = {
    "\\d": "a digit (0-9)", "\\D": "a non-digit",
    "\\w": "a word character (letter, digit, underscore)", "\\W": "a non-word character",
    "\\s": "a whitespace character", "\\S": "a non-whitespace character",
    "\\b": "a word boundary", "\\B": "a non-word boundary",
    "\\n": "a newline", "\\t": "a tab",
  };
  return explanations[token] || "";
}

function describeQuantifier(q: string): string {
  if (!q) return "";
  if (q === "*") return " (zero or more times)";
  if (q === "*?") return " (zero or more times, lazily)";
  if (q === "+") return " (one or more times)";
  if (q === "+?") return " (one or more times, lazily)";
  if (q === "?") return " (optionally)";
  if (q === "??") return " (optionally, lazily)";
  const range = q.match(/^\{(\d+)(,(\d*))?\}\??$/);
  if (range) {
    const min = range[1];
    const max = range[3];
    if (range[2] === undefined) return ` (exactly ${min} times)`;
    if (max === "") return ` (${min} or more times)`;
    return ` (between ${min} and ${max} times)`;
  }
  return "";
}

function describeToken(token: string, quantifier: string): string {
  const qDesc = describeQuantifier(quantifier);
  if (token === "^") return "start of string";
  if (token === "$") return "end of string";
  if (token === ".") return `any character${qDesc}`;
  if (token === "|") return "OR — either the pattern before or after this";
  const known = explainRegexToken(token);
  if (known) return `${known}${qDesc}`;
  if (token.startsWith("[")) {
    const negated = token.startsWith("[^");
    const inner = token.slice(negated ? 2 : 1, -1);
    return `${negated ? "any character NOT in" : "any character in"} the set "${inner}"${qDesc}`;
  }
  if (token.startsWith("(?:")) return `a group (not captured): ${token.slice(3, -1)}${qDesc}`;
  if (token.startsWith("(?=")) return `positive lookahead: must be followed by "${token.slice(3, -1)}"`;
  if (token.startsWith("(?!")) return `negative lookahead: must NOT be followed by "${token.slice(3, -1)}"`;
  if (token.startsWith("(?<=")) return `positive lookbehind: must be preceded by "${token.slice(4, -1)}"`;
  if (token.startsWith("(?<!")) return `negative lookbehind: must NOT be preceded by "${token.slice(4, -1)}"`;
  if (token.startsWith("(")) return `a captured group: ${token.slice(1, -1)}${qDesc}`;
  const display = token.length === 2 && token[0] === "\\" ? token[1] : token;
  return `the literal character "${display}"${qDesc}`;
}

function describeFlags(flags: string): string {
  const map: Record<string, string> = { g: "global (find all matches)", i: "case-insensitive", m: "multiline", s: "dotall", u: "unicode", y: "sticky" };
  return flags.split("").map((f) => map[f] || f).join(", ");
}

function explainRegex(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter a regex pattern");
  const m = trimmed.match(/^\/(.*)\/([a-z]*)$/s);
  const pattern = m ? m[1] : trimmed;
  const flags = m ? m[2] : "";

  try {
    new RegExp(pattern, flags.replace(/[^gimsuy]/g, ""));
  } catch (e) {
    throw new Error("Invalid regex: " + (e instanceof Error ? e.message : ""));
  }

  const tokens: string[] = [];
  let i = 0;
  while (i < pattern.length) {
    let token = "";
    const ch = pattern[i];
    if (ch === "\\") {
      token = pattern.slice(i, i + 2);
      i += 2;
    } else if (ch === "[") {
      let j = i + 1;
      if (pattern[j] === "^") j++;
      if (pattern[j] === "]") j++;
      while (j < pattern.length && pattern[j] !== "]") {
        if (pattern[j] === "\\") j++;
        j++;
      }
      token = pattern.slice(i, j + 1);
      i = j + 1;
    } else if (ch === "(") {
      let depth = 1;
      let j = i + 1;
      while (j < pattern.length && depth > 0) {
        if (pattern[j] === "\\") {
          j += 2;
          continue;
        }
        if (pattern[j] === "(") depth++;
        if (pattern[j] === ")") depth--;
        j++;
      }
      token = pattern.slice(i, j);
      i = j;
    } else {
      token = ch;
      i++;
    }

    let quantifier = "";
    if (i < pattern.length) {
      const q = pattern[i];
      if (q === "*" || q === "+" || q === "?") {
        quantifier = q;
        i++;
        if (pattern[i] === "?") {
          quantifier += "?";
          i++;
        }
      } else if (q === "{") {
        let j = i + 1;
        while (j < pattern.length && pattern[j] !== "}") j++;
        quantifier = pattern.slice(i, j + 1);
        i = j + 1;
      }
    }
    tokens.push(describeToken(token, quantifier));
  }

  const lines = tokens.map((t) => `- ${t}`);
  if (flags) lines.push(`\nFlags: ${describeFlags(flags)}`);
  return lines.join("\n");
}

export default function RegexExplainerPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="re"
        title="Regex Explainer"
        desc="Paste a regex pattern and get a piece-by-piece, plain-English breakdown of what it matches."
      />
      <ToolLab
        inputLabel="Regex pattern"
        outputLabel="Explanation"
        placeholder="/^[\\w.+-]+@[\\w-]+\\.[a-z]{2,}$/i"
        live
        emptyHint="Enter a regex above — the explanation updates automatically."
        onRun={(input) => explainRegex(input)}
      />
    </div>
  );
}
