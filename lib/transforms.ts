import type { NodeTypeId } from "@/lib/data/node-types";
import QRCode from "qrcode";

export type HashAlgo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
export type SortMode = "alpha" | "numeric" | "length";
export type ReverseMode = "char" | "word" | "line";
export type ShuffleMode = "lines" | "words";
export type TruncUnit = "chars" | "words";
export type LoremUnit = "words" | "sentences" | "paragraphs";
export type CsvTsvDirection = "csv2tsv" | "tsv2csv";
export type YamlDirection = "json2yaml" | "yaml2json";
// --- new tool types ---
export type TimestampDirection = "toDate" | "toTimestamp";
export type ColorFormat = "hex" | "rgb" | "hsl";
export type CssUnitFrom = "px" | "rem" | "em" | "pt";
export type BaseFrom = "bin" | "oct" | "dec" | "hex";

export interface NodeSettings {
  indent?: number; // json-format
  algo?: HashAlgo; // hash
  length?: number; // password-gen
  upper?: boolean;
  lower?: boolean;
  digits?: boolean;
  symbols?: boolean;
  // --- newly added settings ---
  pattern?: string; // regex-test
  flags?: string; // regex-test
  find?: string; // find-replace
  replace?: string; // find-replace
  useRegex?: boolean; // find-replace
  times?: number; // text-repeat
  separator?: string; // text-repeat
  truncLength?: number; // text-truncate
  truncUnit?: TruncUnit; // text-truncate
  suffix?: string; // text-truncate
  loremUnit?: LoremUnit; // lorem-gen
  loremCount?: number; // lorem-gen
  pickCount?: number; // random-pick
  shuffleMode?: ShuffleMode; // line-shuffle
  sortMode?: SortMode; // text-sort
  sortReverse?: boolean; // text-sort
  csvDirection?: CsvTsvDirection; // csv-tsv
  jsonPath?: string; // jsonpath
  yamlDirection?: YamlDirection; // json-yaml
  reverseMode?: ReverseMode; // text-reverse
  lineStart?: number; // line-number
  // --- new tool settings ---
  timestampDirection?: TimestampDirection; // unix-timestamp
  colorFormat?: ColorFormat; // color-convert
  cssUnitFrom?: CssUnitFrom; // css-unit-convert
  baseRootPx?: number; // css-unit-convert (root font size for rem/em)
  baseFrom?: BaseFrom; // base-convert
}

export const DEFAULT_SETTINGS: Partial<Record<NodeTypeId, NodeSettings>> = {
  "json-format": { indent: 2 },
  hash: { algo: "SHA-256" },
  "password-gen": { length: 16, upper: true, lower: true, digits: true, symbols: true },
  "regex-test": { pattern: "\\w+", flags: "g" },
  "find-replace": { find: "", replace: "", useRegex: false },
  "text-repeat": { times: 3, separator: "\n" },
  "text-truncate": { truncLength: 100, truncUnit: "chars", suffix: "…" },
  "lorem-gen": { loremUnit: "paragraphs", loremCount: 3 },
  "random-pick": { pickCount: 1 },
  "line-shuffle": { shuffleMode: "lines" },
  "text-sort": { sortMode: "alpha", sortReverse: false },
  "csv-tsv": { csvDirection: "csv2tsv" },
  jsonpath: { jsonPath: "$" },
  "json-yaml": { yamlDirection: "json2yaml" },
  "text-reverse": { reverseMode: "line" },
  "line-number": { lineStart: 1 },
  "unix-timestamp": { timestampDirection: "toDate" },
  "color-convert": { colorFormat: "hex" },
  "css-unit-convert": { cssUnitFrom: "px", baseRootPx: 16 },
  "base-convert": { baseFrom: "dec" },
};

function base64UrlDecode(str: string): string {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return decodeURIComponent(escape(atob(s)));
}

function splitLines(input: string): string[] {
  return input.split(/\r\n|\r|\n/);
}

function parseCsvLine(line: string): string[] {
  // Basic CSV cell split with quoted-field support (no escaped-quote handling).
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cells.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

function csvToJson(input: string): string {
  const lines = input.trim().split(/\r\n|\r|\n/).filter(Boolean);
  if (lines.length === 0) return "[]";
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
  return JSON.stringify(rows, null, 2);
}

function formatXML(xml: string): string {
  const trimmed = xml.replace(/>\s*</g, "><").trim();
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

function wordCount(text: string): string {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
  return `Characters: ${chars}\nWords: ${words}\nLines: ${lines}`;
}

async function hashText(text: string, algo: HashAlgo): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algo, enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function jwtDecode(token: string): string {
  const parts = token.trim().split(".");
  if (parts.length < 2) throw new Error("Not a valid JWT (expected 3 dot-separated parts)");
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  return JSON.stringify({ header, payload }, null, 2);
}

function generatePassword(settings: NodeSettings): string {
  const length = settings.length ?? 16;
  const sets: string[] = [];
  if (settings.upper !== false) sets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (settings.lower !== false) sets.push("abcdefghijklmnopqrstuvwxyz");
  if (settings.digits !== false) sets.push("0123456789");
  if (settings.symbols !== false) sets.push("!@#$%^&*()-_=+[]{}");
  const all = sets.join("") || "abcdefghijklmnopqrstuvwxyz";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < length; i++) out += all[arr[i] % all.length];
  return out;
}

// ---------- newly added transform helpers ----------

function titleCase(text: string): string {
  return text.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

function sentenceCase(text: string): string {
  const lower = text.toLowerCase();
  return lower.replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
}

function uuidV4(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function regexTest(input: string, pattern: string, flags: string): string {
  if (!pattern) return "Enter a pattern in the node settings.";
  const cleanFlags = flags.includes("g") ? flags : `${flags}g`;
  const re = new RegExp(pattern, cleanFlags);
  const matches = Array.from(input.matchAll(re));
  if (matches.length === 0) return "No matches found.";
  return matches
    .map((m, i) => `Match ${i + 1}: "${m[0]}" @ index ${m.index}${m.length > 1 ? `\n  groups: ${JSON.stringify(m.slice(1))}` : ""}`)
    .join("\n");
}

async function qrGenerate(input: string): Promise<string> {
  if (!input.trim()) throw new Error("Nothing to encode into a QR code.");
  return QRCode.toDataURL(input, { margin: 1, width: 256 });
}

function jsonTree(input: string): string {
  const data = JSON.parse(input);
  const lines: string[] = [];
  const walk = (val: unknown, prefix: string, depth: number) => {
    const pad = "  ".repeat(depth);
    if (val !== null && typeof val === "object") {
      const isArr = Array.isArray(val);
      lines.push(`${pad}${prefix}${isArr ? `array[${(val as unknown[]).length}]` : "object"}`);
      if (isArr) {
        (val as unknown[]).forEach((v, i) => walk(v, `[${i}] `, depth + 1));
      } else {
        Object.entries(val as Record<string, unknown>).forEach(([k, v]) => walk(v, `${k}: `, depth + 1));
      }
    } else {
      lines.push(`${pad}${prefix}${typeof val} = ${JSON.stringify(val)}`);
    }
  };
  walk(data, "", 0);
  return lines.join("\n");
}

function csvView(input: string): string {
  const lines = input.trim().split(/\r\n|\r|\n/).filter(Boolean);
  if (lines.length === 0) return "";
  const rows = lines.map(parseCsvLine);
  const colCount = Math.max(...rows.map((r) => r.length));
  const widths = Array.from({ length: colCount }, (_, c) => Math.max(...rows.map((r) => (r[c] ?? "").length)));
  return rows
    .map((r, ri) => {
      const line = Array.from({ length: colCount }, (_, c) => (r[c] ?? "").padEnd(widths[c])).join("  |  ");
      return ri === 0 ? `${line}\n${widths.map((w) => "-".repeat(w)).join("--+--")}` : line;
    })
    .join("\n");
}

function csvClean(input: string): string {
  const lines = input.split(/\r\n|\r|\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return "";
  let rows = lines.map(parseCsvLine).map((r) => r.map((c) => c.trim()));
  const colCount = Math.max(...rows.map((r) => r.length));
  const keepCol = Array.from({ length: colCount }, (_, c) => rows.some((r) => (r[c] ?? "") !== ""));
  rows = rows.map((r) => r.filter((_, c) => keepCol[c]));
  const seen = new Set<string>();
  rows = rows.filter((r, i) => {
    if (i === 0) return true; // keep header
    const key = r.join(",");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return rows.map((r) => r.map((c) => (c.includes(",") ? `"${c}"` : c)).join(",")).join("\n");
}

function csvTsvConvert(input: string, direction: CsvTsvDirection): string {
  const lines = input.split(/\r\n|\r|\n/);
  if (direction === "csv2tsv") {
    return lines.map((l) => parseCsvLine(l).join("\t")).join("\n");
  }
  return lines.map((l) => l.split("\t").join(",")).join("\n");
}

function jsonPathQuery(input: string, path: string): string {
  const data = JSON.parse(input);
  const tokens = path
    .replace(/^\$\.?/, "")
    .replace(/\[(\d+|\*)\]/g, ".$1")
    .split(".")
    .filter(Boolean);

  let results: unknown[] = [data];
  for (const token of tokens) {
    const next: unknown[] = [];
    for (const r of results) {
      if (r === null || r === undefined) continue;
      if (token === "*") {
        if (Array.isArray(r)) next.push(...r);
        else if (typeof r === "object") next.push(...Object.values(r as Record<string, unknown>));
      } else if (/^\d+$/.test(token)) {
        const arr = r as unknown[];
        if (Array.isArray(arr) && arr[Number(token)] !== undefined) next.push(arr[Number(token)]);
      } else {
        const obj = r as Record<string, unknown>;
        if (typeof obj === "object" && token in obj) next.push(obj[token]);
      }
    }
    results = next;
  }
  if (results.length === 0) return "No matches for that JSONPath expression.";
  return JSON.stringify(results.length === 1 ? results[0] : results, null, 2);
}

function markdownToHtml(input: string): string {
  let html = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = html
    .replace(/^###### (.*)$/gm, "<h6>$1</h6>")
    .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
    .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.*)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>\n${m}</ul>\n`);
  html = html
    .split(/\n{2,}/)
    .map((block) => (/^\s*<(h\d|ul|li)/.test(block) ? block : `<p>${block.trim()}</p>`))
    .join("\n");
  return html.trim();
}

function textSort(input: string, mode: SortMode, reverse: boolean): string {
  const lines = splitLines(input);
  const sorted = [...lines].sort((a, b) => {
    if (mode === "numeric") return (parseFloat(a) || 0) - (parseFloat(b) || 0);
    if (mode === "length") return a.length - b.length;
    return a.localeCompare(b);
  });
  if (reverse) sorted.reverse();
  return sorted.join("\n");
}

function dedupeLines(input: string): string {
  const seen = new Set<string>();
  return splitLines(input)
    .filter((l) => {
      if (seen.has(l)) return false;
      seen.add(l);
      return true;
    })
    .join("\n");
}

function removeEmptyLines(input: string): string {
  return splitLines(input)
    .filter((l) => l.trim() !== "")
    .join("\n");
}

function whitespaceClean(input: string): string {
  const collapsed = splitLines(input)
    .map((l) => l.replace(/\t/g, " ").replace(/ {2,}/g, " ").trim())
    .join("\n");
  return collapsed.replace(/\n{3,}/g, "\n\n").trim();
}

function findReplace(input: string, find: string, replace: string, useRegex: boolean): string {
  if (!find) return input;
  if (useRegex) return input.replace(new RegExp(find, "g"), replace);
  return input.split(find).join(replace);
}

function textReverse(input: string, mode: ReverseMode): string {
  if (mode === "char") return input.split("").reverse().join("");
  if (mode === "word") return input.split(/(\s+)/).reverse().join("");
  return splitLines(input).reverse().join("\n");
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function palindromeCheck(input: string): string {
  const normalized = input.toLowerCase().replace(/[^a-z0-9]/g, "");
  const isPalindrome = normalized === normalized.split("").reverse().join("");
  return isPalindrome ? `Yes — "${input}" is a palindrome.` : `No — "${input}" is not a palindrome.`;
}

function textRepeat(input: string, times: number, separator: string): string {
  const n = Math.max(1, Math.floor(times || 1));
  return Array.from({ length: n }, () => input).join(separator ?? "\n");
}

function charFrequency(input: string): string {
  const charCounts = new Map<string, number>();
  for (const ch of input) {
    if (ch.trim() === "") continue;
    charCounts.set(ch, (charCounts.get(ch) ?? 0) + 1);
  }
  const words = input.trim() ? input.trim().toLowerCase().split(/\s+/) : [];
  const wordCounts = new Map<string, number>();
  for (const w of words) wordCounts.set(w, (wordCounts.get(w) ?? 0) + 1);

  const topChars = [...charCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  const topWords = [...wordCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);

  const charLines = topChars.map(([c, n]) => `  "${c}"  ${n}`).join("\n");
  const wordLines = topWords.map(([w, n]) => `  ${w}  ${n}`).join("\n");
  return `Top characters:\n${charLines || "  (none)"}\n\nTop words:\n${wordLines || "  (none)"}`;
}

function lineNumberer(input: string, start: number): string {
  const lines = splitLines(input);
  const width = String(lines.length + start - 1).length;
  return lines.map((l, i) => `${String(i + start).padStart(width, " ")}. ${l}`).join("\n");
}

function textTruncate(input: string, length: number, unit: TruncUnit, suffix: string): string {
  const n = Math.max(0, Math.floor(length || 0));
  if (unit === "words") {
    const words = input.trim().split(/\s+/).filter(Boolean);
    if (words.length <= n) return input;
    return words.slice(0, n).join(" ") + (suffix ?? "…");
  }
  if (input.length <= n) return input;
  return input.slice(0, n) + (suffix ?? "…");
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  const rand = new Uint32Array(out.length);
  crypto.getRandomValues(rand);
  for (let i = out.length - 1; i > 0; i--) {
    const j = rand[i] % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function lineShuffle(input: string, mode: ShuffleMode): string {
  if (mode === "words") return shuffleArray(input.trim().split(/\s+/)).join(" ");
  return shuffleArray(splitLines(input)).join("\n");
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  const groups = w.match(/[aeiouy]+/g) ?? [];
  let count = groups.length;
  if (w.endsWith("e") && count > 1) count -= 1;
  return Math.max(1, count);
}

function readabilityCheck(input: string): string {
  const words = input.trim() ? input.trim().split(/\s+/) : [];
  const sentences = input.split(/[.!?]+/).filter((s) => s.trim() !== "");
  const wordCountN = words.length || 1;
  const sentenceCountN = sentences.length || 1;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const flesch = 206.835 - 1.015 * (wordCountN / sentenceCountN) - 84.6 * (syllables / wordCountN);
  const score = Math.round(flesch * 10) / 10;
  let grade = "Very difficult (graduate level)";
  if (score >= 90) grade = "Very easy (5th grade)";
  else if (score >= 80) grade = "Easy (6th grade)";
  else if (score >= 70) grade = "Fairly easy (7th grade)";
  else if (score >= 60) grade = "Standard (8th-9th grade)";
  else if (score >= 50) grade = "Fairly difficult (10th-12th grade)";
  else if (score >= 30) grade = "Difficult (college level)";
  const minutes = Math.max(1, Math.round(wordCountN / 200));
  return `Words: ${wordCountN}\nSentences: ${sentenceCountN}\nSyllables: ${syllables}\nFlesch Reading Ease: ${score}\nGrade level: ${grade}\nEstimated reading time: ${minutes} min`;
}

function smartQuotes(input: string): string {
  return input
    .replace(/(^|\s)"/g, "$1\u201c")
    .replace(/"/g, "\u201d")
    .replace(/(^|\s)'/g, "$1\u2018")
    .replace(/'/g, "\u2019")
    .replace(/---/g, "\u2014")
    .replace(/--/g, "\u2013")
    .replace(/\.\.\./g, "\u2026");
}

function randomPick(input: string, count: number): string {
  const lines = splitLines(input).filter((l) => l.trim() !== "");
  const n = Math.max(1, Math.min(Math.floor(count || 1), lines.length));
  return shuffleArray(lines).slice(0, n).join("\n");
}

const LOREM_WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat".split(
    " "
  );

function loremWord(i: number): string {
  return LOREM_WORDS[i % LOREM_WORDS.length];
}

function loremGenerate(unit: LoremUnit, count: number): string {
  const n = Math.max(1, Math.floor(count || 1));
  if (unit === "words") {
    return Array.from({ length: n }, (_, i) => loremWord(i)).join(" ");
  }
  const makeSentence = (offset: number) => {
    const len = 6 + (offset % 6);
    const words = Array.from({ length: len }, (_, i) => loremWord(offset + i));
    words[0] = words[0][0].toUpperCase() + words[0].slice(1);
    return words.join(" ") + ".";
  };
  if (unit === "sentences") {
    return Array.from({ length: n }, (_, i) => makeSentence(i * 7)).join(" ");
  }
  // paragraphs
  return Array.from({ length: n }, (_, p) =>
    Array.from({ length: 4 }, (_, s) => makeSentence(p * 30 + s * 7)).join(" ")
  ).join("\n\n");
}

// ---------- minimal block-style YAML support (no anchors/flow-style/multiline scalars) ----------

function yamlScalar(raw: string): unknown {
  const v = raw.trim();
  if (v === "" || v === "~" || v === "null") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d*\.\d+$/.test(v)) return parseFloat(v);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  return v;
}

function parseYaml(yamlStr: string): unknown {
  const rawLines = yamlStr.split(/\r\n|\r|\n/).filter((l) => l.trim() !== "" && !l.trim().startsWith("#"));
  let idx = 0;

  function indentOf(line: string): number {
    return line.length - line.trimStart().length;
  }

  function parseBlock(baseIndent: number): unknown {
    if (idx >= rawLines.length) return null;
    const firstIndent = indentOf(rawLines[idx]);
    if (firstIndent < baseIndent) return null;

    if (rawLines[idx].trim().startsWith("- ") || rawLines[idx].trim() === "-") {
      const arr: unknown[] = [];
      while (idx < rawLines.length && indentOf(rawLines[idx]) === firstIndent && rawLines[idx].trim().startsWith("-")) {
        const line = rawLines[idx];
        const rest = line.trim().slice(1).trim();
        idx += 1;
        if (rest.includes(":")) {
          // inline map start, e.g. "- key: value"
          const colonIdx = rest.indexOf(":");
          const key = rest.slice(0, colonIdx).trim();
          const valueStr = rest.slice(colonIdx + 1).trim();
          const obj: Record<string, unknown> = {};
          obj[key] = valueStr === "" ? parseBlock(firstIndent + 2) : yamlScalar(valueStr);
          // consume any further keys at deeper indent belonging to this same list item
          while (idx < rawLines.length && indentOf(rawLines[idx]) > firstIndent && !rawLines[idx].trim().startsWith("-")) {
            const subIndent = indentOf(rawLines[idx]);
            const subLine = rawLines[idx].trim();
            const subColon = subLine.indexOf(":");
            if (subColon === -1) break;
            const subKey = subLine.slice(0, subColon).trim();
            const subVal = subLine.slice(subColon + 1).trim();
            idx += 1;
            obj[subKey] = subVal === "" ? parseBlock(subIndent + 2) : yamlScalar(subVal);
          }
          arr.push(obj);
        } else if (rest === "") {
          arr.push(parseBlock(firstIndent + 2));
        } else {
          arr.push(yamlScalar(rest));
        }
      }
      return arr;
    }

    const obj: Record<string, unknown> = {};
    while (idx < rawLines.length && indentOf(rawLines[idx]) === firstIndent) {
      const line = rawLines[idx].trim();
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) {
        idx += 1;
        continue;
      }
      const key = line.slice(0, colonIdx).trim();
      const valueStr = line.slice(colonIdx + 1).trim();
      idx += 1;
      if (valueStr === "") {
        obj[key] = parseBlock(firstIndent + 2);
      } else {
        obj[key] = yamlScalar(valueStr);
      }
    }
    return obj;
  }

  return parseBlock(indentOf(rawLines[0] ?? ""));
}

function yamlScalarToString(v: unknown): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "string") return /[:#\-\[\]{}]/.test(v) || v === "" ? `"${v}"` : v;
  return String(v);
}

function serializeYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}[]`;
    return value
      .map((v) => {
        if (v !== null && typeof v === "object") {
          const nested = serializeYaml(v, indent + 1).split("\n");
          return `${pad}- ${nested[0].trim()}\n${nested.slice(1).join("\n")}`;
        }
        return `${pad}- ${yamlScalarToString(v)}`;
      })
      .join("\n");
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return `${pad}{}`;
    return entries
      .map(([k, v]) => {
        if (v !== null && typeof v === "object") {
          return `${pad}${k}:\n${serializeYaml(v, indent + 1)}`;
        }
        return `${pad}${k}: ${yamlScalarToString(v)}`;
      })
      .join("\n");
  }
  return `${pad}${yamlScalarToString(value)}`;
}

function jsonToYamlStr(jsonStr: string): string {
  const data = JSON.parse(jsonStr);
  return serializeYaml(data, 0);
}

function yamlToJsonStr(yamlStr: string): string {
  const data = parseYaml(yamlStr);
  return JSON.stringify(data, null, 2);
}

function yamlLint(input: string): string {
  const data = parseYaml(input);
  return serializeYaml(data, 0);
}

// ---------------------------------------------------------------------------
// Unix Timestamp Converter
// ---------------------------------------------------------------------------
function unixTimestampConvert(input: string, direction: TimestampDirection): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter a timestamp or date");

  if (direction === "toDate") {
    if (!/^-?\d+$/.test(trimmed)) throw new Error("Enter a Unix timestamp (integer seconds or milliseconds)");
    const num = Number(trimmed);
    // Heuristic: 10-digit-ish numbers are seconds, 13-digit-ish are milliseconds.
    const ms = Math.abs(num) > 1e12 ? num : num * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) throw new Error("That number doesn't map to a valid date");
    return [
      `ISO 8601:   ${d.toISOString()}`,
      `UTC:        ${d.toUTCString()}`,
      `Local:      ${d.toString()}`,
      `Unix (s):   ${Math.floor(d.getTime() / 1000)}`,
      `Unix (ms):  ${d.getTime()}`,
    ].join("\n");
  }

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) throw new Error("Enter a valid date (e.g. 2026-07-08T12:00:00Z)");
  return [
    `Unix (s):   ${Math.floor(d.getTime() / 1000)}`,
    `Unix (ms):  ${d.getTime()}`,
    `ISO 8601:   ${d.toISOString()}`,
    `UTC:        ${d.toUTCString()}`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Cron Expression Parser ⇄ Human-readable
// ---------------------------------------------------------------------------
type CronFieldName = "minute" | "hour" | "day of month" | "month" | "day of week";
const CRON_WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function describeCronField(value: string, name: CronFieldName): string {
  if (value === "*") return `every ${name}`;
  if (/^\*\/\d+$/.test(value)) return `every ${value.slice(2)} ${name}(s)`;
  if (/^\d+(-\d+)?(,\d+(-\d+)?)*$/.test(value)) {
    const label = name === "month" ? "month" : name === "day of week" ? "weekday" : name;
    return `${label} ${value}`;
  }
  return `${name} ${value}`;
}

function cronToHuman(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error("Cron expression must have exactly 5 fields: minute hour day-of-month month day-of-week");
  }
  const [min, hour, dom, month, dow] = parts;

  if (min === "*" && hour === "*" && dom === "*" && month === "*" && dow === "*") {
    return "Runs every minute";
  }
  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && dom === "*" && month === "*" && dow === "*") {
    return `Runs every day at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  }
  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && dom === "*" && month === "*" && /^\d+$/.test(dow)) {
    const day = CRON_WEEKDAYS[Number(dow) % 7] ?? dow;
    return `Runs every ${day} at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  }
  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && /^\d+$/.test(dom) && month === "*" && dow === "*") {
    return `Runs on day ${dom} of every month at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  }

  const pieces = [
    describeCronField(min, "minute"),
    describeCronField(hour, "hour"),
    describeCronField(dom, "day of month"),
    describeCronField(month, "month"),
    describeCronField(dow, "day of week"),
  ];
  return `Runs at ${pieces.join(", ")}`;
}

function nextCronRuns(expr: string, count = 5): string[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error("Cron expression must have exactly 5 fields");
  const [minField, hourField, domField, monthField, dowField] = parts;

  function matches(field: string, value: number): boolean {
    if (field === "*") return true;
    return field.split(",").some((part) => {
      const stepMatch = part.match(/^\*\/(\d+)$/);
      if (stepMatch) return value % Number(stepMatch[1]) === 0;
      const rangeMatch = part.match(/^(\d+)-(\d+)$/);
      if (rangeMatch) return value >= Number(rangeMatch[1]) && value <= Number(rangeMatch[2]);
      return Number(part) === value;
    });
  }

  const results: string[] = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  let guard = 0;
  while (results.length < count && guard < 200000) {
    guard++;
    const min = cursor.getMinutes();
    const hour = cursor.getHours();
    const dom = cursor.getDate();
    const month = cursor.getMonth() + 1;
    const dow = cursor.getDay();

    if (
      matches(minField, min) &&
      matches(hourField, hour) &&
      matches(domField, dom) &&
      matches(monthField, month) &&
      matches(dowField, dow)
    ) {
      results.push(cursor.toISOString().replace("T", " ").slice(0, 16));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  if (results.length === 0) throw new Error("Couldn't find an upcoming run — check the expression");
  return results;
}

function cronParse(input: string): string {
  const expr = input.trim();
  const human = cronToHuman(expr);
  const upcoming = nextCronRuns(expr, 5);
  return [human, "", "Next 5 runs (local server time, UTC-based estimate):", ...upcoming.map((t) => `  ${t}`)].join(
    "\n"
  );
}

// ---------------------------------------------------------------------------
// Color Format Converter (HEX / RGB / HSL)
// ---------------------------------------------------------------------------
function parseColorToRgb(input: string): { r: number; g: number; b: number } {
  const s = input.trim();

  const hexMatch = s.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  const rgbMatch = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (rgbMatch) {
    return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) };
  }

  const hslMatch = s.match(/^hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (hslMatch) {
    const h = Number(hslMatch[1]) / 360;
    const sat = Number(hslMatch[2]) / 100;
    const l = Number(hslMatch[3]) / 100;
    if (sat === 0) {
      const v = Math.round(l * 255);
      return { r: v, g: v, b: v };
    }
    const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
    const p = 2 * l - q;
    const hueToRgb = (t: number) => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };
    return {
      r: Math.round(hueToRgb(h + 1 / 3) * 255),
      g: Math.round(hueToRgb(h) * 255),
      b: Math.round(hueToRgb(h - 1 / 3) * 255),
    };
  }

  throw new Error("Enter a color as HEX (#fff), RGB (rgb(255,255,255)), or HSL (hsl(0,0%,100%))");
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): string {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function colorConvert(input: string, target: ColorFormat): string {
  const { r, g, b } = parseColorToRgb(input);
  if (target === "hex") return rgbToHex(r, g, b);
  if (target === "rgb") return `rgb(${r}, ${g}, ${b})`;
  return rgbToHsl(r, g, b);
}

// ---------------------------------------------------------------------------
// Hex Encode / Decode (of text, not colors)
// ---------------------------------------------------------------------------
function hexEncode(input: string): string {
  return Array.from(new TextEncoder().encode(input))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}

function hexDecode(input: string): string {
  const clean = input.trim().replace(/0x/gi, "").replace(/\s+/g, "");
  if (clean.length === 0 || clean.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error("Enter valid hex bytes (e.g. 48 65 6c 6c 6f)");
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

// ---------------------------------------------------------------------------
// CSS Unit Converter (px / rem / em / pt)
// ---------------------------------------------------------------------------
function cssUnitConvert(input: string, from: CssUnitFrom, rootPx: number): string {
  const value = parseFloat(input.trim());
  if (isNaN(value)) throw new Error("Enter a number (e.g. 16)");

  const px = from === "px" ? value : from === "pt" ? value * (96 / 72) : value * rootPx;

  const rem = px / rootPx;
  const em = px / rootPx;
  const pt = px * (72 / 96);

  return [`px:  ${round(px)}px`, `rem: ${round(rem)}rem`, `em:  ${round(em)}em`, `pt:  ${round(pt)}pt`].join("\n");
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

// ---------------------------------------------------------------------------
// HTTP Header Parser
// ---------------------------------------------------------------------------
function httpHeaderParse(input: string): string {
  const lines = input.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) throw new Error("Paste raw HTTP headers, one per line");

  const result: { line: string; header?: string; value?: string }[] = [];
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx === -1) {
      result.push({ line });
      continue;
    }
    result.push({ line, header: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() });
  }

  return JSON.stringify(
    result.map((r) => (r.header ? { [r.header]: r.value } : r.line)),
    null,
    2
  );
}

// ---------------------------------------------------------------------------
// Base Converter (Binary / Octal / Decimal / Hex)
// ---------------------------------------------------------------------------
function baseConvert(input: string, from: BaseFrom): string {
  const trimmed = input.trim().replace(/^0[bxo]/i, "");
  if (!trimmed) throw new Error("Enter a number to convert");

  const valid = {
    bin: /^[01]+$/,
    oct: /^[0-7]+$/,
    dec: /^\d+$/,
    hex: /^[0-9a-fA-F]+$/,
  }[from];

  if (!valid.test(trimmed)) throw new Error(`That isn't a valid ${from} number`);

  const dec = BigInt(
    from === "dec" ? trimmed : `0${from === "bin" ? "b" : from === "oct" ? "o" : "x"}${trimmed}`
  );

  return [
    `Binary:  ${dec.toString(2)}`,
    `Octal:   ${dec.toString(8)}`,
    `Decimal: ${dec.toString(10)}`,
    `Hex:     ${dec.toString(16)}`,
  ].join("\n");
}

export async function runTransform(
  type: NodeTypeId,
  input: string,
  settings: NodeSettings = {}
): Promise<string> {
  switch (type) {
    case "input":
      return input;
    case "export":
      return input;
    case "json-format":
      return JSON.stringify(JSON.parse(input), null, settings.indent ?? 2);
    case "json-minify":
      return JSON.stringify(JSON.parse(input));
    case "csv-json":
      return csvToJson(input);
    case "xml-format":
      return formatXML(input);
    case "base64-encode":
      return btoa(unescape(encodeURIComponent(input)));
    case "base64-decode":
      return decodeURIComponent(escape(atob(input)));
    case "url-encode":
      return encodeURIComponent(input);
    case "url-decode":
      return decodeURIComponent(input);
    case "uppercase":
      return input.toUpperCase();
    case "lowercase":
      return input.toLowerCase();
    case "word-count":
      return wordCount(input);
    case "hash":
      return hashText(input, settings.algo ?? "SHA-256");
    case "jwt-decode":
      return jwtDecode(input);
    case "password-gen":
      return generatePassword(settings);

    // --- newly added ---
    case "title-case":
      return titleCase(input);
    case "sentence-case":
      return sentenceCase(input);
    case "uuid-gen":
      return uuidV4();
    case "regex-test":
      return regexTest(input, settings.pattern ?? "", settings.flags ?? "g");
    case "qr-gen":
      return qrGenerate(input);
    case "json-tree":
      return jsonTree(input);
    case "csv-view":
      return csvView(input);
    case "csv-clean":
      return csvClean(input);
    case "csv-tsv":
      return csvTsvConvert(input, settings.csvDirection ?? "csv2tsv");
    case "jsonpath":
      return jsonPathQuery(input, settings.jsonPath ?? "$");
    case "markdown-preview":
      return markdownToHtml(input);
    case "json-yaml":
      return (settings.yamlDirection ?? "json2yaml") === "json2yaml" ? jsonToYamlStr(input) : yamlToJsonStr(input);
    case "yaml-lint":
      return yamlLint(input);
    case "text-sort":
      return textSort(input, settings.sortMode ?? "alpha", settings.sortReverse ?? false);
    case "dedupe-lines":
      return dedupeLines(input);
    case "remove-empty-lines":
      return removeEmptyLines(input);
    case "whitespace-clean":
      return whitespaceClean(input);
    case "find-replace":
      return findReplace(input, settings.find ?? "", settings.replace ?? "", settings.useRegex ?? false);
    case "text-reverse":
      return textReverse(input, settings.reverseMode ?? "line");
    case "slug-gen":
      return slugify(input);
    case "palindrome-check":
      return palindromeCheck(input);
    case "text-repeat":
      return textRepeat(input, settings.times ?? 3, settings.separator ?? "\n");
    case "char-freq":
      return charFrequency(input);
    case "line-number":
      return lineNumberer(input, settings.lineStart ?? 1);
    case "text-truncate":
      return textTruncate(input, settings.truncLength ?? 100, settings.truncUnit ?? "chars", settings.suffix ?? "…");
    case "line-shuffle":
      return lineShuffle(input, settings.shuffleMode ?? "lines");
    case "readability":
      return readabilityCheck(input);
    case "smart-quotes":
      return smartQuotes(input);
    case "random-pick":
      return randomPick(input, settings.pickCount ?? 1);
    case "lorem-gen":
      return loremGenerate(settings.loremUnit ?? "paragraphs", settings.loremCount ?? 3);

    // --- new tools ---
    case "unix-timestamp":
      return unixTimestampConvert(input, settings.timestampDirection ?? "toDate");
    case "cron-parse":
      return cronParse(input);
    case "color-convert":
      return colorConvert(input, settings.colorFormat ?? "hex");
    case "hex-encode":
      return hexEncode(input);
    case "hex-decode":
      return hexDecode(input);
    case "css-unit-convert":
      return cssUnitConvert(input, settings.cssUnitFrom ?? "px", settings.baseRootPx ?? 16);
    case "http-header-parse":
      return httpHeaderParse(input);
    case "base-convert":
      return baseConvert(input, settings.baseFrom ?? "dec");

    default:
      return input;
  }
}
