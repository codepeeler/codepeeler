import type { NodeTypeId } from "@/lib/data/node-types";
import QRCode from "qrcode";
import { marked } from "marked";
import { load as loadYaml } from "js-yaml";

export type HashAlgo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
export type SortMode = "alpha" | "numeric" | "length";
export type ReverseMode = "char" | "word" | "line";
export type ShuffleMode = "lines" | "words";
export type TruncUnit = "chars" | "words";
export type LoremUnit = "words" | "sentences" | "paragraphs";
export type CsvTsvDirection = "csv2tsv" | "tsv2csv";
export type PctMode = "of" | "is-what-percent" | "change";
export type RomanDirection = "toRoman" | "toNumber";
export type EncodeDirection = "encode" | "decode";
export type QsDirection = "toJson" | "toQuery";
export type YamlDirection = "json2yaml" | "yaml2json";
// --- new tool types ---
export type TimestampDirection = "toDate" | "toTimestamp";
export type ColorFormat = "hex" | "rgb" | "hsl";
export type CssUnitFrom = "px" | "rem" | "em" | "pt";
export type BaseFrom = "bin" | "oct" | "dec" | "hex";
export type SqlKeywordCase = "upper" | "lower" | "preserve";
export type SqlMode = "format" | "minify";
export type HtmlMode = "format" | "minify";
export type CssMode = "format" | "minify";
export type JsMode = "format" | "minify";
// --- batch 3 tool types ---
export type CurlTarget = "fetch" | "axios";
export type UnitCategory = "length" | "weight" | "data";
export type ColorGenFormat = "hex" | "rgb" | "hsl";
export type NanoidAlphabet = "urlsafe" | "alpha" | "numeric" | "hex";
export type BranchType = "feature" | "fix" | "chore" | "hotfix" | "release" | "docs";
// --- batch 4 tool types ---
export type CodeLang = "javascript" | "python" | "java" | "go";
export type CommitType = "feat" | "fix" | "docs" | "style" | "refactor" | "test" | "chore" | "perf";
// --- batch 5 tool types ---
export type PaletteScheme = "complementary" | "analogous" | "triadic" | "tetradic";

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
  sqlMode?: SqlMode; // sql-format
  sqlKeywordCase?: SqlKeywordCase; // sql-format
  sqlIndent?: number; // sql-format
  htmlMode?: HtmlMode; // html-format
  htmlIndent?: number; // html-format
  htmlCollapseWhitespace?: boolean; // html-format (minify)
  htmlRemoveComments?: boolean; // html-format (minify)
  cssMode?: CssMode; // css-format
  cssIndent?: number; // css-format
  cssRemoveComments?: boolean; // css-format (minify)
  jsMode?: JsMode; // js-format
  jsIndent?: number; // js-format
  jsSemi?: boolean; // js-format
  jsSingleQuote?: boolean; // js-format
  jsMangle?: boolean; // js-format (minify)
  // --- batch 2 settings ---
  pctMode?: PctMode; // percentage-calc
  fromTz?: string; // timezone-convert
  toTz?: string; // timezone-convert
  romanDirection?: RomanDirection; // roman-numeral
  caesarShift?: number; // caesar-cipher
  morseDirection?: EncodeDirection; // morse-code
  entityDirection?: EncodeDirection; // html-entity
  unicodeDirection?: EncodeDirection; // unicode-escape
  binaryDirection?: EncodeDirection; // binary-text
  base32Direction?: EncodeDirection; // base32
  hmacSecret?: string; // hmac-gen
  hmacAlgo?: HashAlgo; // hmac-gen
  qsDirection?: QsDirection; // querystring-json
  // --- batch 3 settings ---
  tsInterfaceName?: string; // json-to-ts
  curlTarget?: CurlTarget; // curl-convert
  rngMin?: number; // random-number
  rngMax?: number; // random-number
  rngCount?: number; // random-number
  unitCategory?: UnitCategory; // unit-convert
  unitFrom?: string; // unit-convert
  unitTo?: string; // unit-convert
  nanoidLength?: number; // nanoid-gen
  nanoidAlphabet?: NanoidAlphabet; // nanoid-gen
  colorGenFormat?: ColorGenFormat; // random-color
  colorGenCount?: number; // random-color
  branchType?: BranchType; // git-branch-gen
  // --- batch 4 settings ---
  codeLang?: CodeLang; // regex-to-code
  commitType?: CommitType; // commit-msg-gen
  commitScope?: string; // commit-msg-gen
  commitBreaking?: boolean; // commit-msg-gen
  // --- batch 5 settings ---
  schemaName?: string; // json-to-zod
  gqlTypeName?: string; // json-to-graphql
  passphraseWordCount?: number; // passphrase-gen
  passphraseSeparator?: string; // passphrase-gen
  passphraseCapitalize?: boolean; // passphrase-gen
  passphraseIncludeNumber?: boolean; // passphrase-gen
  ulidCount?: number; // ulid-gen
  paletteScheme?: PaletteScheme; // color-palette-gen
  fluidMaxSize?: number; // fluid-type-calc
  fluidMinVw?: number; // fluid-type-calc
  fluidMaxVw?: number; // fluid-type-calc
  rateLimitMax?: number; // rate-limit-calc
  rateLimitWindow?: number; // rate-limit-calc
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
  "sql-format": { sqlMode: "format", sqlKeywordCase: "upper", sqlIndent: 2 },
  "html-format": { htmlMode: "format", htmlIndent: 2, htmlCollapseWhitespace: true, htmlRemoveComments: true },
  "css-format": { cssMode: "format", cssIndent: 2, cssRemoveComments: true },
  "js-format": { jsMode: "format", jsIndent: 2, jsSemi: true, jsSingleQuote: false, jsMangle: true },
  "percentage-calc": { pctMode: "of" },
  "timezone-convert": { fromTz: "UTC", toTz: "America/New_York" },
  "roman-numeral": { romanDirection: "toRoman" },
  "caesar-cipher": { caesarShift: 13 },
  "morse-code": { morseDirection: "encode" },
  "html-entity": { entityDirection: "encode" },
  "unicode-escape": { unicodeDirection: "encode" },
  "binary-text": { binaryDirection: "encode" },
  base32: { base32Direction: "encode" },
  "hmac-gen": { hmacSecret: "", hmacAlgo: "SHA-256" },
  "querystring-json": { qsDirection: "toJson" },
  // --- batch 3 defaults ---
  "json-to-ts": { tsInterfaceName: "Root" },
  "curl-convert": { curlTarget: "fetch" },
  "random-number": { rngMin: 1, rngMax: 100, rngCount: 5 },
  "unit-convert": { unitCategory: "length", unitFrom: "m", unitTo: "ft" },
  "nanoid-gen": { nanoidLength: 21, nanoidAlphabet: "urlsafe" },
  "random-color": { colorGenFormat: "hex", colorGenCount: 5 },
  "git-branch-gen": { branchType: "feature" },
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

// ---------------------------------------------------------------------------
// SQL Formatter / Minifier
// ---------------------------------------------------------------------------
const SQL_MAJOR_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "UNION ALL",
  "UNION",
  "RETURNING",
];

const SQL_JOIN_KEYWORDS = [
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "FULL OUTER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "INNER JOIN",
  "CROSS JOIN",
  "FULL JOIN",
  "JOIN",
];

const SQL_INDENT_KEYWORDS = ["AND", "OR", "ON"];

// Keywords that always get a space before "(" — as opposed to function
// names, which glue directly onto "(".
const SQL_SPACE_BEFORE_PAREN_KEYWORDS = new Set(["IN", "EXISTS", "NOT", "VALUES", "AND", "OR", "BETWEEN"]);

const SQL_ALL_KEYWORDS = [
  "SELECT",
  "DISTINCT",
  "FROM",
  "WHERE",
  "AND",
  "OR",
  "NOT",
  "IN",
  "IS",
  "NULL",
  "AS",
  "ON",
  "GROUP",
  "GROUP BY",
  "ORDER",
  "ORDER BY",
  "BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "INSERT",
  "INSERT INTO",
  "INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "DELETE FROM",
  "CREATE",
  "TABLE",
  "ALTER",
  "DROP",
  "JOIN",
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "CROSS JOIN",
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "FULL OUTER JOIN",
  "UNION",
  "UNION ALL",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "BETWEEN",
  "LIKE",
  "EXISTS",
  "ASC",
  "DESC",
  "RETURNING",
  "PRIMARY KEY",
  "FOREIGN KEY",
  "REFERENCES",
  "DEFAULT",
  "WITH",
];

/**
 * Strips string/quoted literals out of a SQL statement so the rest of the
 * formatter never has to worry about keywords appearing inside them —
 * replaces each literal with a placeholder token and returns both the
 * "masked" SQL and the list of original literals to restore afterwards.
 */
function extractSqlLiterals(sql: string): { masked: string; literals: string[] } {
  const literals: string[] = [];
  // Matches '...' (with doubled '' escapes) or "..." or `...` identifiers.
  const masked = sql.replace(/'(?:[^']|'')*'|"(?:[^"]|"")*"|`(?:[^`])*`/g, (m) => {
    literals.push(m);
    return `\u0000${literals.length - 1}\u0000`;
  });
  return { masked, literals };
}

function restoreSqlLiterals(sql: string, literals: string[]): string {
  return sql.replace(/\u0000(\d+)\u0000/g, (_, i) => literals[Number(i)]);
}

function stripSqlComments(sql: string): string {
  // Line comments (-- ...) and block comments (/* ... */); literals are
  // already masked by the caller so this can't accidentally eat a string.
  return sql.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

function applySqlKeywordCase(token: string, mode: SqlKeywordCase): string {
  if (mode === "preserve") return token;
  const isKeyword = SQL_ALL_KEYWORDS.includes(token.toUpperCase());
  if (!isKeyword) return token;
  return mode === "upper" ? token.toUpperCase() : token.toLowerCase();
}

// Multi-word keywords that must be matched as a single unit, longest-first
// so e.g. "LEFT OUTER JOIN" is never partially matched as just "JOIN".
const SQL_MULTI_WORD_KEYWORDS = [...SQL_MAJOR_KEYWORDS, ...SQL_JOIN_KEYWORDS]
  .filter((kw) => kw.includes(" "))
  .sort((a, b) => b.length - a.length);

/** Tokens that should never get a space inserted before them (they glue to the previous token). */
const SQL_NO_SPACE_BEFORE = new Set([",", ")", ";", "."]);

/** Tokenizes masked SQL into words, numbers, qualified identifiers, operators, punctuation, and placeholder literals, merging multi-word keywords into single tokens. */
function tokenizeSql(sql: string): string[] {
  // Split into raw tokens: literal placeholders, dotted identifiers (a.b), numbers
  // (incl. decimals), words, multi-char operators, or single punctuation chars.
  const raw =
    sql.match(
      /\u0000\d+\u0000|[A-Za-z_][A-Za-z_0-9]*(?:\.[A-Za-z_][A-Za-z_0-9]*)*|\d+(?:\.\d+)?|<=|>=|<>|!=|[(),;]|[=<>+\-*/%]/g
    ) ?? [];

  // Greedily merge consecutive tokens that form one of the known multi-word keywords.
  const tokens: string[] = [];
  let i = 0;
  outer: while (i < raw.length) {
    for (const kw of SQL_MULTI_WORD_KEYWORDS) {
      const parts = kw.split(" ");
      if (raw.slice(i, i + parts.length).map((t) => t.toUpperCase()).join(" ") === kw) {
        tokens.push(parts.join(" "));
        i += parts.length;
        continue outer;
      }
    }
    tokens.push(raw[i]);
    i += 1;
  }
  return tokens;
}

function isMajorClauseToken(tok: string): boolean {
  const upper = tok.toUpperCase();
  return SQL_MAJOR_KEYWORDS.includes(upper) || SQL_JOIN_KEYWORDS.includes(upper);
}

function formatSql(input: string, keywordCase: SqlKeywordCase, indentSize: number): string {
  if (!input.trim()) throw new Error("Enter a SQL query to format");

  const { masked, literals } = extractSqlLiterals(input);
  const stripped = stripSqlComments(masked).trim();
  if (!stripped) throw new Error("Enter a SQL query to format");

  const tokens = tokenizeSql(stripped);
  const indent = " ".repeat(indentSize);

  const lines: string[] = [];
  // Each line is built as an array of rendered tokens, joined with correct
  // spacing only at the very end — avoids ad-hoc string-suffix checks.
  let currentTokens: string[] = [];
  let currentIndent = "";
  let depth = 0;
  // Tracks whether the current line is a comma-separated clause body
  // (columns after SELECT, values after VALUES, columns after GROUP BY...)
  // so subsequent top-level commas break onto their own indented line.
  let inColumnList = false;

  const joinLine = (toks: string[]): string => {
    let out = "";
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      const prev = toks[i - 1];
      const isFunctionCallParen =
        t === "(" &&
        prev !== undefined &&
        /^[A-Za-z_][A-Za-z_0-9.]*$/.test(prev) &&
        !isMajorClauseToken(prev) &&
        !SQL_INDENT_KEYWORDS.includes(prev.toUpperCase()) &&
        !SQL_SPACE_BEFORE_PAREN_KEYWORDS.has(prev.toUpperCase());
      if (out && !SQL_NO_SPACE_BEFORE.has(t) && !out.endsWith("(") && !out.endsWith(".") && !isFunctionCallParen) out += " ";
      out += t;
    }
    return out;
  };

  const flush = () => {
    if (currentTokens.length > 0) lines.push(currentIndent + joinLine(currentTokens));
    currentTokens = [];
    currentIndent = "";
  };

  for (const tok of tokens) {
    const upper = tok.toUpperCase();

    if (tok === "(") {
      depth += 1;
      currentTokens.push("(");
      continue;
    }
    if (tok === ")") {
      depth = Math.max(0, depth - 1);
      currentTokens.push(")");
      continue;
    }

    if (isMajorClauseToken(tok)) {
      flush();
      inColumnList = ["SELECT", "GROUP BY", "ORDER BY", "VALUES"].includes(upper);
      currentTokens = [applySqlKeywordCase(tok, keywordCase)];
      continue;
    }

    if (SQL_INDENT_KEYWORDS.includes(upper) && depth === 0) {
      flush();
      currentIndent = indent;
      currentTokens = [applySqlKeywordCase(tok, keywordCase)];
      continue;
    }

    if (tok === "," && depth === 0 && inColumnList) {
      currentTokens.push(",");
      flush();
      currentIndent = indent;
      continue;
    }

    currentTokens.push(applySqlKeywordCase(tok, keywordCase));
  }
  flush();

  const result = lines.join("\n");
  return restoreSqlLiterals(result, literals).trim();
}

function minifySql(input: string): string {
  if (!input.trim()) throw new Error("Enter a SQL query to minify");
  const { masked, literals } = extractSqlLiterals(input);
  let sql = stripSqlComments(masked);
  sql = sql
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
  return restoreSqlLiterals(sql, literals);
}

// ---------------------------------------------------------------------------
// HTML Formatter / Minifier
// ---------------------------------------------------------------------------
const HTML_VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

// Elements whose inner content must never be reformatted or have its
// whitespace collapsed (raw text / significant-whitespace elements).
const HTML_PRESERVE_CONTENT = new Set(["pre", "textarea", "script", "style"]);

type HtmlToken =
  | { kind: "doctype"; raw: string }
  | { kind: "comment"; raw: string }
  | { kind: "open"; name: string; raw: string; selfClosed: boolean }
  | { kind: "close"; name: string; raw: string }
  | { kind: "text"; raw: string }
  | { kind: "raw"; raw: string }; // verbatim content of <script>/<style>/<pre>/<textarea>

/** Tokenizes an HTML string into tags, text runs, comments, and doctype — respecting raw-text elements. */
function tokenizeHtml(html: string): HtmlToken[] {
  const tokens: HtmlToken[] = [];
  let i = 0;
  const n = html.length;

  while (i < n) {
    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i + 4);
      const stop = end === -1 ? n : end + 3;
      tokens.push({ kind: "comment", raw: html.slice(i, stop) });
      i = stop;
      continue;
    }

    if (html.startsWith("<!", i)) {
      const end = html.indexOf(">", i);
      const stop = end === -1 ? n : end + 1;
      tokens.push({ kind: "doctype", raw: html.slice(i, stop) });
      i = stop;
      continue;
    }

    if (html[i] === "<" && /[a-zA-Z/]/.test(html[i + 1] ?? "")) {
      const end = html.indexOf(">", i);
      if (end === -1) {
        tokens.push({ kind: "text", raw: html.slice(i) });
        break;
      }
      const raw = html.slice(i, end + 1);
      const isClose = raw[1] === "/";
      const nameMatch = raw.match(isClose ? /^<\/\s*([a-zA-Z0-9-]+)/ : /^<\s*([a-zA-Z0-9-]+)/);
      const name = (nameMatch?.[1] ?? "").toLowerCase();

      if (isClose) {
        tokens.push({ kind: "close", name, raw });
        i = end + 1;
        continue;
      }

      const selfClosed = /\/\s*>$/.test(raw) || HTML_VOID_ELEMENTS.has(name);
      tokens.push({ kind: "open", name, raw, selfClosed });
      i = end + 1;

      // Raw-text elements: capture everything up to the matching close tag verbatim.
      if (HTML_PRESERVE_CONTENT.has(name) && !selfClosed) {
        const closeRe = new RegExp(`</\\s*${name}\\s*>`, "i");
        const rest = html.slice(i);
        const m = closeRe.exec(rest);
        const contentEnd = m ? m.index : rest.length;
        const content = rest.slice(0, contentEnd);
        if (content) tokens.push({ kind: "raw", raw: content });
        i += contentEnd;
        if (m) {
          tokens.push({ kind: "close", name, raw: m[0] });
          i += m[0].length;
        }
      }
      continue;
    }

    // Plain text run up to the next tag/comment.
    const nextLt = html.indexOf("<", i);
    const stop = nextLt === -1 ? n : nextLt;
    tokens.push({ kind: "text", raw: html.slice(i, stop) });
    i = stop === i ? i + 1 : stop;
  }

  return tokens;
}

// Inline elements: their presence as a child doesn't force the parent
// onto multiple lines (used together with HTML_TEXT_CONTAINER_ELEMENTS below).
const HTML_INLINE_ELEMENTS = new Set([
  "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn", "em",
  "i", "kbd", "mark", "q", "s", "samp", "small", "span", "strong", "sub",
  "sup", "time", "u", "var", "wbr",
]);

// Elements that typically hold a short run of prose/inline content — safe
// to collapse onto a single line when their children are inline-only.
// Generic containers (div, ul, section, ...) always expand instead, even
// if their immediate children happen to be inline elements.
const HTML_TEXT_CONTAINER_ELEMENTS = new Set([
  "p", "li", "dt", "dd", "td", "th", "figcaption", "label", "button",
  "h1", "h2", "h3", "h4", "h5", "h6", "caption", "summary", "legend", "option", "title",
]);

function formatHtml(input: string, indentSize: number): string {
  if (!input.trim()) throw new Error("Enter HTML to format");

  const tokens = tokenizeHtml(input);
  const indentUnit = " ".repeat(indentSize);
  const lines: string[] = [];
  let depth = 0;

  const pushLine = (text: string, depthOverride?: number) => {
    const d = depthOverride ?? depth;
    lines.push(indentUnit.repeat(Math.max(0, d)) + text);
  };

  // Renders a run of tokens (text + inline tags, possibly nested) into a
  // single flat string with normal spacing — used so inline content like
  // "some text <a href=#>a link</a>." stays on one line instead of
  // exploding every inline tag onto its own line.
  const renderInlineRun = (run: HtmlToken[]): string => {
    let out = "";
    for (const t of run) {
      if (t.kind === "text") {
        // Collapse internal whitespace but keep a leading/trailing single
        // space if the original text had one — that's what separates
        // "text " from a following <a> tag, or "</a> " from following text.
        const collapsed = t.raw.replace(/\s+/g, " ");
        out += collapsed;
      } else {
        out += t.kind === "raw" ? t.raw : t.raw.trim();
      }
    }
    return out.replace(/\s+/g, " ").trim();
  };

  let idx = 0;
  while (idx < tokens.length) {
    const tok = tokens[idx];

    if (tok.kind === "doctype") {
      pushLine(tok.raw.trim());
      idx += 1;
      continue;
    }

    if (tok.kind === "comment") {
      pushLine(tok.raw.trim());
      idx += 1;
      continue;
    }

    if (tok.kind === "text") {
      // A stray text run between block-level tags (usually just whitespace) —
      // collapse and only emit if it has real content.
      const trimmed = tok.raw.replace(/\s+/g, " ").trim();
      if (trimmed) pushLine(trimmed);
      idx += 1;
      continue;
    }

    if (tok.kind === "raw") {
      const trimmed = tok.raw.replace(/^\n/, "").replace(/\s+$/, "");
      if (trimmed) {
        for (const line of trimmed.split("\n")) pushLine(line);
      }
      idx += 1;
      continue;
    }

    if (tok.kind === "close") {
      depth = Math.max(0, depth - 1);
      pushLine(tok.raw.trim());
      idx += 1;
      continue;
    }

    // tok.kind === "open"
    if (tok.selfClosed) {
      pushLine(tok.raw.trim());
      idx += 1;
      continue;
    }

    if (HTML_PRESERVE_CONTENT.has(tok.name)) {
      pushLine(tok.raw.trim());
      depth += 1;
      idx += 1;
      continue;
    }

    // Look ahead: does this element's content consist only of text and
    // inline elements (no block-level children)? If so, render the whole
    // subtree as one inline run on a single line.
    let scan = idx + 1;
    let inlineDepth = 0;
    let onlyInline = true;
    while (scan < tokens.length) {
      const s = tokens[scan];
      if (s.kind === "close" && s.name === tok.name && inlineDepth === 0) break;
      if (s.kind === "open") {
        if (!HTML_INLINE_ELEMENTS.has(s.name) && !s.selfClosed) {
          onlyInline = false;
          break;
        }
        if (!s.selfClosed) inlineDepth += 1;
      } else if (s.kind === "close") {
        inlineDepth = Math.max(0, inlineDepth - 1);
      } else if (s.kind === "raw" || s.kind === "comment" || s.kind === "doctype") {
        onlyInline = false;
        break;
      }
      scan += 1;
    }
    const hasMatchingClose = scan < tokens.length && tokens[scan].kind === "close" && (tokens[scan] as { name: string }).name === tok.name;

    const canCollapse = HTML_TEXT_CONTAINER_ELEMENTS.has(tok.name) || HTML_INLINE_ELEMENTS.has(tok.name);
    if (onlyInline && hasMatchingClose && canCollapse) {
      const run = tokens.slice(idx + 1, scan);
      const inner = renderInlineRun(run);
      const openTag = tok.raw.trim();
      const closeTag = tokens[scan].raw.trim();
      pushLine(inner ? `${openTag}${inner}${closeTag}` : `${openTag}${closeTag}`);
      idx = scan + 1;
      continue;
    }

    // Otherwise it's a genuine block-level container: open tag on its own
    // line, recurse into children normally, close tag on its own line.
    pushLine(tok.raw.trim());
    depth += 1;
    idx += 1;
  }

  return lines.filter((l) => l.trim().length > 0).join("\n");
}

function minifyHtml(input: string, collapseWhitespace: boolean, removeComments: boolean): string {
  if (!input.trim()) throw new Error("Enter HTML to minify");

  const tokens = tokenizeHtml(input);
  let out = "";

  for (const tok of tokens) {
    if (tok.kind === "comment") {
      if (!removeComments) out += tok.raw;
      continue;
    }
    if (tok.kind === "doctype") {
      out += tok.raw.replace(/\s+/g, " ").trim() + " ";
      continue;
    }
    if (tok.kind === "open" || tok.kind === "close") {
      out += tok.raw.replace(/\s+/g, " ").replace(/\s*>/g, ">").replace(/<\s*/g, "<").trim();
      continue;
    }
    if (tok.kind === "raw") {
      out += tok.raw;
      continue;
    }
    if (tok.kind === "text") {
      out += collapseWhitespace ? tok.raw.replace(/\s+/g, " ") : tok.raw;
      continue;
    }
  }

  // Collapse whitespace introduced between adjacent tags, but never touch
  // anything inside preserved raw blocks (already emitted verbatim above).
  if (collapseWhitespace) {
    out = out.replace(/>\s+</g, "><").trim();
  }

  return out;
}

// ---------------------------------------------------------------------------
// CSS Formatter / Minifier
// ---------------------------------------------------------------------------

/** Masks CSS string literals and comments so brace/semicolon scanning can't be confused by their contents. */
function extractCssLiterals(css: string): { masked: string; literals: string[] } {
  const literals: string[] = [];
  const masked = css.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\/\*[\s\S]*?\*\//g, (m) => {
    literals.push(m);
    return `\u0000${literals.length - 1}\u0000`;
  });
  return { masked, literals };
}

function restoreCssLiterals(css: string, literals: string[]): string {
  return css.replace(/\u0000(\d+)\u0000/g, (_, i) => literals[Number(i)]);
}

/** True if a masked placeholder token is standing in for a /* comment *​/ (as opposed to a string literal). */
function isCommentLiteral(literal: string): boolean {
  return literal.startsWith("/*");
}

function formatCss(input: string, indentSize: number): string {
  if (!input.trim()) throw new Error("Enter CSS to format");

  const { masked, literals } = extractCssLiterals(input);
  const trimmed = masked.trim();
  if (!trimmed) throw new Error("Enter CSS to format");

  const indentUnit = " ".repeat(indentSize);
  const lines: string[] = [];
  let depth = 0;
  let buf = "";

  const flushSelectorOrAtRule = (text: string) => {
    const t = text.trim();
    if (!t) return;
    lines.push(indentUnit.repeat(depth) + t + " {");
  };

  const flushDeclarationsBlock = (text: string) => {
    // Splits a run of "prop: value; prop2: value2;" (with masked literals)
    // into one declaration per line, normalizing "prop:value" -> "prop: value".
    // Only splits on semicolons at paren-depth 0, so a semicolon embedded in
    // e.g. url(data:image/png;base64,...) doesn't break the declaration.
    const decls: string[] = [];
    let cur = "";
    let pd = 0;
    for (const c of text) {
      if (c === "(") pd += 1;
      if (c === ")") pd = Math.max(0, pd - 1);
      if (c === ";" && pd === 0) {
        decls.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    if (cur.trim()) decls.push(cur);

    for (const raw of decls) {
      const d = raw.trim();
      if (!d) continue;
      // Only touch the first colon (the property/value separator) — pseudo-selectors
      // like "::before" or values containing ":" (e.g. URLs) never reach here since
      // this only runs on flushed declaration text, not selectors.
      const colonIdx = d.indexOf(":");
      const normalized =
        colonIdx === -1 ? d : `${d.slice(0, colonIdx).trim()}: ${d.slice(colonIdx + 1).trim()}`;
      lines.push(indentUnit.repeat(depth) + normalized + ";");
    }
  };

  let i = 0;
  const n = trimmed.length;
  let parenDepth = 0;
  while (i < n) {
    const ch = trimmed[i];

    if (ch === "\u0000") {
      // A masked literal (string or comment) sitting outside any other
      // token — emit comments as their own line, fold strings into buf.
      const end = trimmed.indexOf("\u0000", i + 1);
      const token = trimmed.slice(i, end + 1);
      const idxMatch = token.match(/\u0000(\d+)\u0000/);
      const literal = idxMatch ? literals[Number(idxMatch[1])] : "";
      if (isCommentLiteral(literal) && buf.trim() === "" && parenDepth === 0) {
        lines.push(indentUnit.repeat(depth) + literal);
      } else {
        buf += token;
      }
      i = end + 1;
      continue;
    }

    if (ch === "(") {
      parenDepth += 1;
      buf += ch;
      i += 1;
      continue;
    }

    if (ch === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      buf += ch;
      i += 1;
      continue;
    }

    if (ch === "{" && parenDepth === 0) {
      flushSelectorOrAtRule(buf);
      buf = "";
      depth += 1;
      i += 1;
      continue;
    }

    if (ch === "}" && parenDepth === 0) {
      if (buf.trim()) flushDeclarationsBlock(buf);
      buf = "";
      depth = Math.max(0, depth - 1);
      lines.push(indentUnit.repeat(depth) + "}");
      i += 1;
      continue;
    }

    if (ch === ";" && parenDepth === 0) {
      buf += ";";
      flushDeclarationsBlock(buf);
      buf = "";
      i += 1;
      continue;
    }

    buf += ch;
    i += 1;
  }

  if (buf.trim()) lines.push(indentUnit.repeat(depth) + buf.trim());

  const result = lines.join("\n");
  return restoreCssLiterals(result, literals).trim();
}

function minifyCss(input: string, removeComments: boolean): string {
  if (!input.trim()) throw new Error("Enter CSS to minify");

  const { masked, literals } = extractCssLiterals(input);
  let css = masked;

  css = css
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();

  const restored = css.replace(/\u0000(\d+)\u0000/g, (_, i) => {
    const literal = literals[Number(i)];
    if (isCommentLiteral(literal)) return removeComments ? "" : literal;
    return literal;
  });

  return restored.replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// JS Formatter / Minifier — powered by Prettier (format) and Terser (minify).
// Both are loaded dynamically so their (fairly large) bundles are only
// pulled in when this specific tool is actually used.
// ---------------------------------------------------------------------------
async function formatJs(
  input: string,
  indentSize: number,
  semi: boolean,
  singleQuote: boolean
): Promise<string> {
  if (!input.trim()) throw new Error("Enter JavaScript to format");

  const [{ default: prettier }, { default: babelPlugin }, { default: estreePlugin }] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/babel"),
    import("prettier/plugins/estree"),
  ]);

  try {
    return await prettier.format(input, {
      parser: "babel",
      plugins: [babelPlugin, estreePlugin],
      tabWidth: indentSize,
      semi,
      singleQuote,
    });
  } catch (e) {
    throw new Error(e instanceof Error ? `Syntax error: ${e.message.split("\n")[0]}` : "Failed to format JavaScript");
  }
}

async function minifyJs(input: string, mangle: boolean): Promise<string> {
  if (!input.trim()) throw new Error("Enter JavaScript to minify");

  const { minify } = await import("terser");

  try {
    const result = await minify(input, {
      compress: true,
      mangle,
      format: { comments: false },
    });
    if (!result.code) throw new Error("Minification produced no output");
    return result.code;
  } catch (e) {
    if (e instanceof Error) throw new Error(`Syntax error: ${e.message.split("\n")[0]}`);
    throw new Error("Failed to minify JavaScript");
  }
}

// ---------- Percentage Calculator ----------
function percentageCalc(input: string, mode: PctMode): string {
  const parts = input.split(/[,\n]/).map((p) => parseFloat(p.trim())).filter((n) => !isNaN(n));
  if (parts.length < 2) throw new Error("Enter two numbers separated by a comma, e.g. 25, 200");
  const [a, b] = parts;
  if (mode === "of") {
    return `${a}% of ${b} = ${round4((a / 100) * b)}`;
  } else if (mode === "is-what-percent") {
    if (b === 0) throw new Error("Second number can't be zero");
    return `${a} is ${round4((a / b) * 100)}% of ${b}`;
  } else {
    if (a === 0) throw new Error("First number can't be zero (used as the base)");
    const change = ((b - a) / a) * 100;
    const dir = change >= 0 ? "increase" : "decrease";
    return `${round4(Math.abs(change))}% ${dir} (from ${a} to ${b})`;
  }
}
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

// ---------- Timezone Converter ----------
function timezoneConvert(input: string, fromTz: string, toTz: string): string {
  const raw = input.trim();
  if (!raw) throw new Error("Enter a date/time, e.g. 2026-07-17 14:30");
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00` : raw.replace(" ", "T");
  const asUtc = new Date(
    new Date(normalized).toLocaleString("en-US", { timeZone: fromTz === "UTC" ? "UTC" : fromTz })
  );
  const parsedLocal = new Date(normalized);
  if (isNaN(parsedLocal.getTime())) throw new Error("Couldn't parse that date/time");
  // Interpret the input as wall-clock time in `fromTz`, then render in `toTz`.
  const utcMs = wallTimeToUtc(normalized, fromTz);
  const target = new Date(utcMs);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: toTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });
  void asUtc;
  return `${fmt.format(target)}\n\nUTC: ${target.toISOString()}`;
}
function wallTimeToUtc(isoLocal: string, timeZone: string): number {
  const asIfUtc = new Date(isoLocal + "Z").getTime();
  const tzDate = new Date(new Date(asIfUtc).toLocaleString("en-US", { timeZone }));
  const utcDate = new Date(new Date(asIfUtc).toLocaleString("en-US", { timeZone: "UTC" }));
  const offset = tzDate.getTime() - utcDate.getTime();
  return asIfUtc - offset;
}

// ---------- ISO 8601 Formatter/Validator ----------
function iso8601Format(input: string): string {
  const raw = input.trim();
  const d = new Date(raw);
  if (isNaN(d.getTime())) throw new Error("Couldn't parse that as a date/time");
  const iso = d.toISOString();
  const lines = [
    `ISO 8601: ${iso}`,
    `Date only: ${iso.slice(0, 10)}`,
    `Unix ms:   ${d.getTime()}`,
    `Unix sec:  ${Math.floor(d.getTime() / 1000)}`,
    `Weekday:   ${d.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })}`,
  ];
  return lines.join("\n");
}

// ---------- Date Difference Calculator ----------
function dateDifference(input: string): string {
  const parts = input.split(/[,\n]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) throw new Error("Enter two dates separated by a comma, e.g. 2026-01-01, 2026-07-17");
  const d1 = new Date(parts[0]);
  const d2 = new Date(parts[1]);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) throw new Error("Couldn't parse one of those dates");
  const [early, late] = d1.getTime() <= d2.getTime() ? [d1, d2] : [d2, d1];
  const totalMs = late.getTime() - early.getTime();
  const totalDays = Math.floor(totalMs / 86400000);
  let years = late.getFullYear() - early.getFullYear();
  let months = late.getMonth() - early.getMonth();
  let days = late.getDate() - early.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(late.getFullYear(), late.getMonth(), 0).getDate();
    days += prevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return [
    `${years} years, ${months} months, ${days} days`,
    `Total days: ${totalDays}`,
    `Total weeks: ${round4(totalDays / 7)}`,
    `Total hours: ${Math.floor(totalMs / 3600000)}`,
  ].join("\n");
}

// ---------- Roman Numeral Converter ----------
const ROMAN_MAP: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];
function toRoman(num: number): string {
  if (!Number.isInteger(num) || num < 1 || num > 3999) {
    throw new Error("Enter a whole number between 1 and 3999");
  }
  let result = "";
  let n = num;
  for (const [value, symbol] of ROMAN_MAP) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }
  return result;
}
function fromRoman(str: string): number {
  const clean = str.trim().toUpperCase();
  if (!/^[MDCLXVI]+$/.test(clean)) throw new Error("Enter valid Roman numerals (M, D, C, L, X, V, I)");
  const values: Record<string, number> = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 };
  let total = 0;
  for (let i = 0; i < clean.length; i++) {
    const cur = values[clean[i]];
    const next = values[clean[i + 1]];
    if (next && cur < next) total -= cur;
    else total += cur;
  }
  if (toRoman(total) !== clean) throw new Error("That's not a valid canonical Roman numeral");
  return total;
}
function romanNumeral(input: string, direction: RomanDirection): string {
  const raw = input.trim();
  if (!raw) throw new Error("Enter a value");
  if (direction === "toRoman") return toRoman(parseInt(raw, 10));
  return String(fromRoman(raw));
}

// ---------- ROT13 / Caesar Cipher ----------
function caesarCipher(input: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return input.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + s) % 26) + base);
  });
}

// ---------- Morse Code ----------
const MORSE_MAP: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.",
  "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-",
  "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.", "$": "...-..-", "@": ".--.-.",
};
const MORSE_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);
function morseEncode(input: string): string {
  return input
    .toUpperCase()
    .split(" ")
    .map((word) =>
      word
        .split("")
        .map((ch) => {
          if (ch === "") return "";
          const code = MORSE_MAP[ch];
          if (!code) throw new Error(`No Morse mapping for "${ch}"`);
          return code;
        })
        .join(" ")
    )
    .join(" / ");
}
function morseDecode(input: string): string {
  const clean = input.trim();
  if (!clean) throw new Error("Enter Morse code, e.g. .... . .-.. .-.. ---");
  return clean
    .split(" / ")
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((code) => {
          const ch = MORSE_REVERSE[code];
          if (!ch) throw new Error(`Unrecognized Morse token "${code}"`);
          return ch;
        })
        .join("")
    )
    .join(" ");
}
function morseCode(input: string, direction: EncodeDirection): string {
  return direction === "encode" ? morseEncode(input) : morseDecode(input);
}

// ---------- HTML Entity Encode/Decode ----------
const HTML_ENTITY_MAP: [string, string][] = [
  ["&", "&amp;"], ["<", "&lt;"], [">", "&gt;"], ['"', "&quot;"], ["'", "&#39;"],
];
function htmlEntityEncode(input: string): string {
  let out = input;
  for (const [ch, ent] of HTML_ENTITY_MAP) out = out.split(ch).join(ent);
  return out;
}
function htmlEntityDecode(input: string): string {
  let out = input;
  for (const [ch, ent] of [...HTML_ENTITY_MAP].reverse()) out = out.split(ent).join(ch);
  out = out.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
  out = out.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return out;
}
function htmlEntity(input: string, direction: EncodeDirection): string {
  return direction === "encode" ? htmlEntityEncode(input) : htmlEntityDecode(input);
}

// ---------- Unicode Escape/Unescape ----------
function unicodeEscape(input: string): string {
  return Array.from(input)
    .map((ch) => {
      const cp = ch.codePointAt(0)!;
      if (cp < 128) return ch;
      return cp > 0xffff
        ? `\\u{${cp.toString(16)}}`
        : `\\u${cp.toString(16).padStart(4, "0")}`;
    })
    .join("");
}
function unicodeUnescape(input: string): string {
  return input
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}
function unicodeEscapeTool(input: string, direction: EncodeDirection): string {
  return direction === "encode" ? unicodeEscape(input) : unicodeUnescape(input);
}

// ---------- Binary <-> Text ----------
function binaryEncode(input: string): string {
  return Array.from(new TextEncoder().encode(input))
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(" ");
}
function binaryDecode(input: string): string {
  const clean = input.trim().split(/\s+/).filter(Boolean);
  if (clean.length === 0 || clean.some((b) => !/^[01]{1,8}$/.test(b))) {
    throw new Error("Enter valid 8-bit binary groups, e.g. 01001000 01101001");
  }
  const bytes = new Uint8Array(clean.map((b) => parseInt(b, 2)));
  return new TextDecoder().decode(bytes);
}
function binaryText(input: string, direction: EncodeDirection): string {
  return direction === "encode" ? binaryEncode(input) : binaryDecode(input);
}

// ---------- Base32 Encode/Decode ----------
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, "0");
    out += BASE32_ALPHABET[parseInt(chunk, 2)];
  }
  while (out.length % 8 !== 0) out += "=";
  return out;
}
function base32Decode(input: string): string {
  const clean = input.trim().toUpperCase().replace(/=+$/, "");
  if (!/^[A-Z2-7]*$/.test(clean) || clean.length === 0) {
    throw new Error("Enter a valid Base32 string (A-Z, 2-7)");
  }
  let bits = "";
  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error(`Invalid Base32 character "${ch}"`);
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}
function base32Tool(input: string, direction: EncodeDirection): string {
  return direction === "encode" ? base32Encode(input) : base32Decode(input);
}

// ---------- HMAC Generator ----------
async function hmacGenerate(input: string, secret: string, algo: HashAlgo): Promise<string> {
  if (!secret) throw new Error("Enter a secret key in the settings above");
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: algo },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(input));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------- URL Parser ----------
function urlParse(input: string): string {
  const raw = input.trim();
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Enter a full URL, e.g. https://example.com/path?a=1");
  }
  const lines = [
    `Protocol:  ${url.protocol}`,
    `Host:      ${url.hostname}`,
    `Port:      ${url.port || "(default)"}`,
    `Path:      ${url.pathname}`,
    `Query:     ${url.search || "(none)"}`,
    `Hash:      ${url.hash || "(none)"}`,
    `Origin:    ${url.origin}`,
  ];
  if (url.search) {
    lines.push("", "Query params:");
    url.searchParams.forEach((v, k) => lines.push(`  ${k} = ${v}`));
  }
  return lines.join("\n");
}

// ---------- Query String <-> JSON ----------
function queryStringToJson(input: string): string {
  const raw = input.trim().replace(/^\?/, "");
  if (!raw) throw new Error("Enter a query string, e.g. a=1&b=two");
  const params = new URLSearchParams(raw);
  const obj: Record<string, string | string[]> = {};
  params.forEach((v, k) => {
    if (obj[k] === undefined) obj[k] = v;
    else obj[k] = Array.isArray(obj[k]) ? [...(obj[k] as string[]), v] : [obj[k] as string, v];
  });
  return JSON.stringify(obj, null, 2);
}
function jsonToQueryString(input: string): string {
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(input);
  } catch {
    throw new Error("Enter valid flat JSON, e.g. {\"a\":1,\"b\":\"two\"}");
  }
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) v.forEach((item) => params.append(k, String(item)));
    else params.append(k, String(v));
  }
  return params.toString();
}
function queryStringJson(input: string, direction: QsDirection): string {
  return direction === "toJson" ? queryStringToJson(input) : jsonToQueryString(input);
}

// ---------- User-Agent Parser ----------
function userAgentParse(input: string): string {
  const ua = input.trim();
  if (!ua) throw new Error("Paste a User-Agent string");

  let browser = "Unknown";
  let browserVersion = "";
  const browserPatterns: [RegExp, string][] = [
    [/Edg\/([\d.]+)/, "Edge"],
    [/OPR\/([\d.]+)/, "Opera"],
    [/Chrome\/([\d.]+)/, "Chrome"],
    [/CriOS\/([\d.]+)/, "Chrome (iOS)"],
    [/FxiOS\/([\d.]+)/, "Firefox (iOS)"],
    [/Firefox\/([\d.]+)/, "Firefox"],
    [/Version\/([\d.]+).*Safari/, "Safari"],
  ];
  for (const [re, name] of browserPatterns) {
    const m = ua.match(re);
    if (m) {
      browser = name;
      browserVersion = m[1];
      break;
    }
  }

  let os = "Unknown";
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows NT/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android ([\d.]+)/.test(ua)) os = `Android ${ua.match(/Android ([\d.]+)/)![1]}`;
  else if (/iPhone OS ([\d_]+)/.test(ua)) os = `iOS ${ua.match(/iPhone OS ([\d_]+)/)![1].replace(/_/g, ".")}`;
  else if (/iPad/.test(ua)) os = "iPadOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let device = "Desktop";
  if (/iPad/.test(ua)) device = "Tablet (iPad)";
  else if (/Mobile|iPhone|Android.*Mobile/.test(ua)) device = "Mobile";
  else if (/Android/.test(ua)) device = "Tablet";

  const isBot = /bot|crawl|spider|slurp/i.test(ua);

  return [
    `Browser:  ${browser}${browserVersion ? " " + browserVersion : ""}`,
    `OS:       ${os}`,
    `Device:   ${device}`,
    `Is bot:   ${isBot ? "Yes" : "No"}`,
  ].join("\n");
}


// ===========================================================================
// Batch 3 tools
// ===========================================================================

// --- JSON to TypeScript Interface ---
function jsonToTs(input: string, rootName: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON");
  }
  const interfaces: string[] = [];
  const seen = new Set<string>();

  function capitalize(s: string): string {
    const clean = s
      .replace(/[^a-zA-Z0-9]/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");
    const safe = clean || "Field";
    return /^[A-Za-z_]/.test(safe) ? safe : "I" + safe;
  }

  function typeOf(value: unknown, name: string): string {
    if (value === null) return "null";
    if (Array.isArray(value)) {
      if (value.length === 0) return "unknown[]";
      const elTypes = Array.from(new Set(value.map((v) => typeOf(v, name.replace(/s$/, "")))));
      return elTypes.length === 1 ? `${elTypes[0]}[]` : `(${elTypes.join(" | ")})[]`;
    }
    const t = typeof value;
    if (t === "object") {
      const iName = capitalize(name);
      buildInterface(value as Record<string, unknown>, iName);
      return iName;
    }
    if (t === "number" || t === "string" || t === "boolean") return t;
    return "unknown";
  }

  function buildInterface(obj: Record<string, unknown>, name: string) {
    const lines: string[] = [`interface ${name} {`];
    for (const key of Object.keys(obj)) {
      const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `"${key}"`;
      lines.push(`  ${safeKey}: ${typeOf(obj[key], key)};`);
    }
    lines.push("}");
    if (!seen.has(name)) {
      seen.add(name);
      interfaces.push(lines.join("\n"));
    }
  }

  const root = capitalize(rootName || "Root");
  if (Array.isArray(data)) {
    const elType = typeOf(data[0] ?? {}, root);
    interfaces.push(`type ${root} = ${elType}[];`);
  } else if (data && typeof data === "object") {
    buildInterface(data as Record<string, unknown>, root);
  } else {
    throw new Error("Top-level JSON must be an object or array");
  }

  return interfaces.join("\n\n");
}

// --- Markdown <-> HTML ---
async function markdownToHtmlConvert(input: string): Promise<string> {
  if (!input.trim()) throw new Error("Enter some Markdown");
  marked.setOptions({ gfm: true, breaks: true });
  return await marked.parse(input);
}

function htmlToMarkdownConvert(input: string): string {
  if (!input.trim()) throw new Error("Enter some HTML");
  let s = input;
  s = s.replace(/<!--([\s\S]*?)-->/g, "");
  s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n");
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n");
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n");
  s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n");
  s = s.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n##### $1\n");
  s = s.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n###### $1\n");
  s = s.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, "**$2**");
  s = s.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, "_$2_");
  s = s.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_m: string, c: string) => `\n\`\`\`\n${c.replace(/<[^>]+>/g, "")}\n\`\`\`\n`);
  s = s.replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`");
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m: string, c: string) =>
    c
      .trim()
      .split("\n")
      .map((l: string) => `> ${l.trim()}`)
      .join("\n") + "\n"
  );
  s = s.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  s = s.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  s = s.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, "![$1]($2)");
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
  s = s.replace(/<\/(ul|ol)>/gi, "\n");
  s = s.replace(/<(ul|ol)[^>]*>/gi, "\n");
  s = s.replace(/<br\s*\/?>/gi, "  \n");
  s = s.replace(/<\/p>/gi, "\n\n");
  s = s.replace(/<p[^>]*>/gi, "");
  s = s.replace(/<hr\s*\/?>/gi, "\n---\n");
  s = s.replace(/<[^>]+>/g, "");
  s = s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  s = s.replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

// --- cURL to Fetch/Axios ---
function tokenizeCurl(cmd: string): string[] {
  const tokens: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cmd))) tokens.push(m[1] ?? m[2] ?? m[3]);
  return tokens;
}

function curlConvert(input: string, target: CurlTarget): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Paste a curl command");
  const tokens = tokenizeCurl(trimmed.replace(/^curl\s+/, "").replace(/\\\n/g, " "));
  let url = "";
  let method = "GET";
  const headers: Record<string, string> = {};
  let body: string | null = null;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "-X" || t === "--request") {
      method = tokens[++i];
    } else if (t === "-H" || t === "--header") {
      const raw = tokens[++i] ?? "";
      const sep = raw.indexOf(":");
      if (sep > -1) headers[raw.slice(0, sep).trim()] = raw.slice(sep + 1).trim();
    } else if (t === "-d" || t === "--data" || t === "--data-raw" || t === "--data-binary" || t === "--data-urlencode") {
      body = tokens[++i];
      if (method === "GET") method = "POST";
    } else if (t === "-u" || t === "--user") {
      headers["Authorization"] = `Basic ${tokens[++i]}`;
    } else if (t.startsWith("-")) {
      // skip unknown flags
    } else if (!url) {
      url = t;
    }
  }
  if (!url) throw new Error("Couldn't find a URL in that curl command");

  if (target === "fetch") {
    const opts: string[] = [`method: "${method}"`];
    if (Object.keys(headers).length) {
      opts.push(`headers: ${JSON.stringify(headers, null, 2).split("\n").join("\n  ")}`);
    }
    if (body) opts.push(`body: ${JSON.stringify(body)}`);
    return `fetch("${url}", {\n  ${opts.join(",\n  ")}\n})\n  .then((res) => res.json())\n  .then((data) => console.log(data));`;
  }

  const axiosParts: string[] = [];
  if (Object.keys(headers).length) {
    axiosParts.push(`headers: ${JSON.stringify(headers, null, 2).split("\n").join("\n  ")}`);
  }
  let dataArg = "";
  if (body) {
    try {
      dataArg = `, ${JSON.stringify(JSON.parse(body))}`;
    } catch {
      dataArg = `, ${JSON.stringify(body)}`;
    }
  }
  const cfg = axiosParts.length ? `, {\n  ${axiosParts.join(",\n  ")}\n}` : "";
  return `axios.${method.toLowerCase()}("${url}"${dataArg}${cfg})\n  .then((res) => console.log(res.data));`;
}

// --- Random Number Generator ---
function randomNumberGenerate(min: number, max: number, count: number): string {
  if (min > max) throw new Error("Min must be less than or equal to Max");
  const n = Math.max(1, Math.min(Math.round(count), 1000));
  const range = max - min + 1;
  const arr = new Uint32Array(n);
  crypto.getRandomValues(arr);
  const results: number[] = [];
  for (let i = 0; i < n; i++) results.push(min + (arr[i] % range));
  return results.join("\n");
}

// --- Unit Converter ---
const UNIT_FACTORS: Record<string, Record<string, number>> = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 },
  weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.028349523125, t: 1000 },
  data: { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4, bit: 0.125 },
};

function unitConvertValue(input: string, category: UnitCategory, from: string, to: string): string {
  const value = Number(input.trim());
  if (isNaN(value)) throw new Error("Enter a number to convert");
  const table = UNIT_FACTORS[category];
  if (!table || !(from in table) || !(to in table)) throw new Error("Unsupported unit for this category");
  const base = value * table[from];
  const result = base / table[to];
  return `${result.toLocaleString("en-US", { maximumFractionDigits: 8 })} ${to}`;
}

// --- .env Parser / Validator ---
function envParse(input: string): string {
  if (!input.trim()) throw new Error("Paste .env content");
  const lines = input.split("\n");
  const result: Record<string, string> = {};
  const issues: string[] = [];
  const seen = new Set<string>();

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const eq = line.indexOf("=");
    if (eq === -1) {
      issues.push(`Line ${idx + 1}: missing "=" — "${line}"`);
      return;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) issues.push(`Line ${idx + 1}: invalid variable name "${key}"`);
    if (seen.has(key)) issues.push(`Line ${idx + 1}: duplicate key "${key}"`);
    seen.add(key);
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  });

  const out = [`// ${Object.keys(result).length} variable(s) parsed`, JSON.stringify(result, null, 2)];
  if (issues.length) out.push("", "// Issues:", issues.map((i) => `// - ${i}`).join("\n"));
  else out.push("", "// No issues found");
  return out.join("\n");
}

// --- JSON to CSV ---
function csvEscapeVal(val: unknown): string {
  const s = val === null || val === undefined ? "" : typeof val === "object" ? JSON.stringify(val) : String(val);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function jsonToCsvConvert(input: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON");
  }
  const arr = Array.isArray(data) ? data : [data];
  if (!arr.length) throw new Error("JSON array is empty");
  const columns = Array.from(
    new Set(arr.flatMap((row) => (row && typeof row === "object" ? Object.keys(row as object) : ["value"])))
  );
  const lines = [columns.map(csvEscapeVal).join(",")];
  for (const row of arr) {
    const obj: Record<string, unknown> =
      row && typeof row === "object" ? (row as Record<string, unknown>) : { value: row };
    lines.push(columns.map((c) => csvEscapeVal(obj[c])).join(","));
  }
  return lines.join("\n");
}

// --- Nanoid Generator ---
const NANOID_ALPHABETS: Record<string, string> = {
  urlsafe: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-",
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  numeric: "0123456789",
  hex: "0123456789abcdef",
};

function nanoidGenerate(length: number, alphabetKey: string): string {
  const alphabet = NANOID_ALPHABETS[alphabetKey] ?? NANOID_ALPHABETS.urlsafe;
  const len = Math.max(1, Math.min(Math.round(length), 256));
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[arr[i] % alphabet.length];
  return out;
}

// --- Prime Checker / Generator ---
function isPrimeNum(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
  return true;
}

function primeFactorsOf(n: number): number[] {
  const factors: number[] = [];
  let x = n;
  for (let i = 2; i * i <= x; i++) {
    while (x % i === 0) {
      factors.push(i);
      x /= i;
    }
  }
  if (x > 1) factors.push(x);
  return factors;
}

function primeCheck(input: string): string {
  const n = Number(input.trim());
  if (!Number.isInteger(n)) throw new Error("Enter a whole number");
  const prime = isPrimeNum(n);
  if (prime) return `${n} is prime.`;
  const factors = n > 1 ? primeFactorsOf(n) : [];
  return `${n} is not prime.${factors.length ? `\nPrime factors: ${factors.join(" × ")}` : ""}`;
}

function primeList(input: string): string {
  const parts = input.split(",").map((s) => Number(s.trim()));
  const min = parts.length >= 2 ? parts[0] : 2;
  const max = parts.length >= 2 ? parts[1] : parts[0] || 100;
  if (isNaN(min) || isNaN(max) || min > max) throw new Error("Enter a range like 2,100");
  if (max - min > 1000000) throw new Error("Range too large — keep it under 1,000,000");
  const primes: number[] = [];
  for (let i = Math.max(2, Math.floor(min)); i <= max; i++) if (isPrimeNum(i)) primes.push(i);
  return primes.length ? primes.join(", ") : "No primes in that range.";
}

// --- Statistics Calculator ---
function statisticsCalc(input: string): string {
  const nums = input
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
  if (nums.length === 0 || nums.some((n) => isNaN(n))) throw new Error("Enter numbers separated by commas or newlines");
  const sorted = [...nums].sort((a, b) => a - b);
  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / nums.length;
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const freq = new Map<number, number>();
  nums.forEach((n) => freq.set(n, (freq.get(n) ?? 0) + 1));
  const maxFreq = Math.max(...freq.values());
  const modes = maxFreq > 1 ? [...freq.entries()].filter(([, c]) => c === maxFreq).map(([v]) => v) : [];
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
  const stddev = Math.sqrt(variance);
  return [
    `Count:    ${nums.length}`,
    `Sum:      ${sum}`,
    `Mean:     ${mean.toFixed(4)}`,
    `Median:   ${median}`,
    `Mode:     ${modes.length ? modes.join(", ") : "none"}`,
    `Min:      ${sorted[0]}`,
    `Max:      ${sorted[sorted.length - 1]}`,
    `Range:    ${sorted[sorted.length - 1] - sorted[0]}`,
    `Variance: ${variance.toFixed(4)}`,
    `Std Dev:  ${stddev.toFixed(4)}`,
  ].join("\n");
}

// --- ASCII <-> Text ---
function asciiEncode(input: string): string {
  if (!input) throw new Error("Enter text to convert");
  return Array.from(input)
    .map((c) => c.codePointAt(0))
    .join(" ");
}

function asciiDecode(input: string): string {
  const parts = input.trim().split(/[\s,]+/).filter(Boolean);
  if (!parts.length) throw new Error("Enter ASCII/Unicode codes separated by spaces");
  return parts
    .map((p) => {
      const n = Number(p);
      if (isNaN(n)) throw new Error(`"${p}" isn't a valid code`);
      return String.fromCodePoint(n);
    })
    .join("");
}

// --- Random Color Generator ---
function randomColorGenerate(format: ColorGenFormat, count: number): string {
  const n = Math.max(1, Math.min(Math.round(count), 100));
  const arr = new Uint8Array(n * 3);
  crypto.getRandomValues(arr);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const r = arr[i * 3],
      g = arr[i * 3 + 1],
      b = arr[i * 3 + 2];
    if (format === "rgb") out.push(`rgb(${r}, ${g}, ${b})`);
    else if (format === "hsl") out.push(rgbToHsl(r, g, b));
    else out.push(rgbToHex(r, g, b));
  }
  return out.join("\n");
}

// --- Punycode (IDN) Encode/Decode ---
const PC_BASE = 36,
  PC_TMIN = 1,
  PC_TMAX = 26,
  PC_SKEW = 38,
  PC_DAMP = 700,
  PC_INITIAL_BIAS = 72,
  PC_INITIAL_N = 128;

function pcAdapt(delta: number, numPoints: number, firstTime: boolean): number {
  let d = firstTime ? Math.floor(delta / PC_DAMP) : Math.floor(delta / 2);
  d += Math.floor(d / numPoints);
  let k = 0;
  while (d > ((PC_BASE - PC_TMIN) * PC_TMAX) >> 1) {
    d = Math.floor(d / (PC_BASE - PC_TMIN));
    k += PC_BASE;
  }
  return k + Math.floor(((PC_BASE - PC_TMIN + 1) * d) / (d + PC_SKEW));
}

function pcDigitToChar(d: number): string {
  return d < 26 ? String.fromCharCode(d + 97) : String.fromCharCode(d - 26 + 48);
}

function pcCharToDigit(c: string): number {
  const code = c.charCodeAt(0);
  if (code >= 48 && code <= 57) return code - 22;
  if (code >= 97 && code <= 122) return code - 97;
  if (code >= 65 && code <= 90) return code - 65;
  throw new Error(`Invalid punycode character "${c}"`);
}

function punycodeEncodeLabel(label: string): string {
  const input = Array.from(label).map((c) => c.codePointAt(0)!);
  const output: string[] = [];
  const basic = input.filter((c) => c < 0x80);
  basic.forEach((c) => output.push(String.fromCharCode(c)));
  let h = basic.length;
  const b = h;
  if (b > 0) output.push("-");

  let n = PC_INITIAL_N,
    delta = 0,
    bias = PC_INITIAL_BIAS;

  while (h < input.length) {
    let m = Infinity;
    for (const c of input) if (c >= n && c < m) m = c;
    delta += (m - n) * (h + 1);
    n = m;
    for (const c of input) {
      if (c < n) delta++;
      if (c === n) {
        let q = delta;
        for (let k = PC_BASE; ; k += PC_BASE) {
          const t = k <= bias ? PC_TMIN : k >= bias + PC_TMAX ? PC_TMAX : k - bias;
          if (q < t) break;
          output.push(pcDigitToChar(t + ((q - t) % (PC_BASE - t))));
          q = Math.floor((q - t) / (PC_BASE - t));
        }
        output.push(pcDigitToChar(q));
        bias = pcAdapt(delta, h + 1, h === b);
        delta = 0;
        h++;
      }
    }
    delta++;
    n++;
  }
  return "xn--" + output.join("");
}

function punycodeDecodeLabel(label: string): string {
  if (!label.toLowerCase().startsWith("xn--")) return label;
  const rest = label.slice(4);
  const lastDash = rest.lastIndexOf("-");
  const basic = lastDash >= 0 ? rest.slice(0, lastDash) : "";
  const codePart = lastDash >= 0 ? rest.slice(lastDash + 1) : rest;
  let output: number[] = basic ? Array.from(basic).map((c) => c.charCodeAt(0)) : [];

  let n = PC_INITIAL_N,
    i = 0,
    bias = PC_INITIAL_BIAS,
    idx = 0;

  while (idx < codePart.length) {
    const oldI = i;
    let w = 1;
    for (let k = PC_BASE; ; k += PC_BASE) {
      if (idx >= codePart.length) throw new Error("Invalid punycode input");
      const digit = pcCharToDigit(codePart[idx++]);
      i += digit * w;
      const t = k <= bias ? PC_TMIN : k >= bias + PC_TMAX ? PC_TMAX : k - bias;
      if (digit < t) break;
      w *= PC_BASE - t;
    }
    bias = pcAdapt(i - oldI, output.length + 1, oldI === 0);
    n += Math.floor(i / (output.length + 1));
    i %= output.length + 1;
    output.splice(i, 0, n);
    i++;
  }
  return output.map((c) => String.fromCodePoint(c)).join("");
}

function punycodeEncode(input: string): string {
  if (!input.trim()) throw new Error("Enter a domain name");
  return input
    .trim()
    .split(".")
    .map((label) => (/^[\x00-\x7F]*$/.test(label) ? label : punycodeEncodeLabel(label)))
    .join(".");
}

function punycodeDecode(input: string): string {
  if (!input.trim()) throw new Error("Enter a punycode domain (e.g. xn--...)");
  return input.trim().split(".").map(punycodeDecodeLabel).join(".");
}

// --- Base58 Encode/Decode ---
const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58Encode(input: string): string {
  if (!input) throw new Error("Enter text to encode");
  const bytes = new TextEncoder().encode(input);
  let num = 0n;
  for (const b of bytes) num = num * 256n + BigInt(b);
  let out = "";
  while (num > 0n) {
    const rem = num % 58n;
    out = B58_ALPHABET[Number(rem)] + out;
    num /= 58n;
  }
  let leadingZeros = 0;
  for (const b of bytes) {
    if (b === 0) leadingZeros++;
    else break;
  }
  return B58_ALPHABET[0].repeat(leadingZeros) + out;
}

function base58Decode(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter Base58 text to decode");
  let num = 0n;
  for (const ch of trimmed) {
    const idx = B58_ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error(`"${ch}" is not a valid Base58 character`);
    num = num * 58n + BigInt(idx);
  }
  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num % 256n));
    num /= 256n;
  }
  let leadingOnes = 0;
  for (const ch of trimmed) {
    if (ch === B58_ALPHABET[0]) leadingOnes++;
    else break;
  }
  const finalBytes = [...Array(leadingOnes).fill(0), ...bytes];
  return new TextDecoder().decode(new Uint8Array(finalBytes));
}

// --- robots.txt Validator ---
function robotsValidate(input: string): string {
  if (!input.trim()) throw new Error("Paste robots.txt content");
  const lines = input.split("\n");
  const issues: string[] = [];
  const validDirectives = ["user-agent", "disallow", "allow", "sitemap", "crawl-delay", "host"];
  let currentAgent: string | null = null;
  let agentCount = 0;
  let sawRuleBeforeAgent = false;

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const colon = line.indexOf(":");
    if (colon === -1) {
      issues.push(`Line ${idx + 1}: no colon found — "${line}"`);
      return;
    }
    const directive = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (!validDirectives.includes(directive)) {
      issues.push(`Line ${idx + 1}: unknown directive "${directive}"`);
      return;
    }
    if (directive === "user-agent") {
      currentAgent = value;
      agentCount++;
      if (!value) issues.push(`Line ${idx + 1}: empty User-agent value`);
    } else if (directive === "disallow" || directive === "allow") {
      if (!currentAgent) sawRuleBeforeAgent = true;
      if (value && !value.startsWith("/") && value !== "*") {
        issues.push(`Line ${idx + 1}: "${directive}" path should start with "/" — got "${value}"`);
      }
    } else if (directive === "sitemap") {
      if (!/^https?:\/\//.test(value)) issues.push(`Line ${idx + 1}: Sitemap should be an absolute URL`);
    } else if (directive === "crawl-delay") {
      if (isNaN(Number(value))) issues.push(`Line ${idx + 1}: Crawl-delay should be a number`);
    }
  });

  if (sawRuleBeforeAgent) issues.push("Found a Disallow/Allow rule before any User-agent line");
  if (agentCount === 0) issues.push("No User-agent directive found");

  return issues.length
    ? `Found ${issues.length} issue(s):\n\n${issues.map((i) => `✗ ${i}`).join("\n")}`
    : "✓ No issues found — robots.txt looks valid.";
}

// --- CRC32 Checksum ---
let CRC32_TABLE: Uint32Array | null = null;
function getCrc32Table(): Uint32Array {
  if (CRC32_TABLE) return CRC32_TABLE;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  CRC32_TABLE = table;
  return table;
}

function crc32Checksum(input: string): string {
  if (!input) throw new Error("Enter text to checksum");
  const table = getCrc32Table();
  const bytes = new TextEncoder().encode(input);
  let crc = 0xffffffff;
  for (const b of bytes) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  crc = (crc ^ 0xffffffff) >>> 0;
  return crc.toString(16).padStart(8, "0");
}

// --- Git Branch Name Generator ---
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

// --- SVG to CSS Data URI ---
function svgToDataUriBase64(input: string): string {
  if (!input.includes("<svg")) throw new Error("Paste raw SVG markup");
  const b64 = btoa(unescape(encodeURIComponent(input.trim())));
  return `background-image: url("data:image/svg+xml;base64,${b64}");`;
}

function svgToDataUriUrl(input: string): string {
  if (!input.includes("<svg")) throw new Error("Paste raw SVG markup");
  const cleaned = input.trim().replace(/\s+/g, " ");
  const encoded = cleaned
    .replace(/"/g, "'")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/&/g, "%26");
  return `background-image: url("data:image/svg+xml,${encoded}");`;
}


// ===========================================================================
// Batch 4 tools
// ===========================================================================

// --- TOML <-> JSON ---
function parseTomlValue(raw: string): unknown {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+$/.test(raw)) return parseInt(raw, 10);
  if (/^-?\d*\.\d+$/.test(raw)) return parseFloat(raw);
  if (raw.startsWith("[") && raw.endsWith("]")) {
    const inner = raw.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((v) => parseTomlValue(v.trim()));
  }
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  return raw;
}

function parseToml(input: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let current: Record<string, unknown> = result;
  input.split("\n").forEach((rawLine) => {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) return;
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      const path = sectionMatch[1].split(".").map((s) => s.trim());
      current = result;
      for (const p of path) {
        if (!(p in current) || typeof current[p] !== "object") current[p] = {};
        current = current[p] as Record<string, unknown>;
      }
      return;
    }
    const eq = line.indexOf("=");
    if (eq === -1) return;
    const key = line.slice(0, eq).trim();
    current[key] = parseTomlValue(line.slice(eq + 1).trim());
  });
  return result;
}

function tomlToJsonConvert(input: string): string {
  if (!input.trim()) throw new Error("Paste TOML content");
  return JSON.stringify(parseToml(input), null, 2);
}

function tomlValueLiteral(v: unknown): string {
  if (typeof v === "string") return `"${v.replace(/"/g, '\\"')}"`;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `[${v.map(tomlValueLiteral).join(", ")}]`;
  return `"${String(v)}"`;
}

function serializeToml(obj: Record<string, unknown>, prefix = ""): string {
  const scalarLines: string[] = [];
  const sectionLines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const path = prefix ? `${prefix}.${key}` : key;
      sectionLines.push(`[${path}]\n${serializeToml(value as Record<string, unknown>, path)}`);
    } else {
      scalarLines.push(`${key} = ${tomlValueLiteral(value)}`);
    }
  }
  return [scalarLines.join("\n"), sectionLines.join("\n")].filter(Boolean).join("\n\n");
}

function jsonToTomlConvert(input: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON");
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) throw new Error("Top-level JSON must be an object");
  return serializeToml(data as Record<string, unknown>);
}

// --- INI <-> JSON ---
function parseIni(input: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let section: Record<string, unknown> = result;
  input.split("\n").forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith(";") || line.startsWith("#")) return;
    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      const name = sectionMatch[1].trim();
      result[name] = {};
      section = result[name] as Record<string, unknown>;
      return;
    }
    const eq = line.indexOf("=");
    if (eq === -1) return;
    const key = line.slice(0, eq).trim();
    let val: unknown = line.slice(eq + 1).trim();
    if (val === "true") val = true;
    else if (val === "false") val = false;
    else if (/^-?\d+$/.test(val as string)) val = parseInt(val as string, 10);
    section[key] = val;
  });
  return result;
}

function iniToJsonConvert(input: string): string {
  if (!input.trim()) throw new Error("Paste INI content");
  return JSON.stringify(parseIni(input), null, 2);
}

function jsonToIniConvert(input: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON");
  }
  if (typeof data !== "object" || data === null) throw new Error("Top-level JSON must be an object");
  const obj = data as Record<string, unknown>;
  const rootLines: string[] = [];
  const sectionBlocks: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const lines = Object.entries(value as Record<string, unknown>).map(([k, v]) => `${k}=${v}`);
      sectionBlocks.push(`[${key}]\n${lines.join("\n")}`);
    } else {
      rootLines.push(`${key}=${value}`);
    }
  }
  return [rootLines.join("\n"), sectionBlocks.join("\n\n")].filter(Boolean).join("\n\n");
}

// --- Password Strength Checker ---
function checkPasswordStrength(input: string): string {
  if (!input) throw new Error("Enter a password to check");
  const len = input.length;
  const hasLower = /[a-z]/.test(input);
  const hasUpper = /[A-Z]/.test(input);
  const hasDigit = /\d/.test(input);
  const hasSymbol = /[^A-Za-z0-9]/.test(input);
  const varietyCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  const charsetSize = (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasDigit ? 10 : 0) + (hasSymbol ? 32 : 0);
  const entropy = charsetSize > 0 ? Math.log2(charsetSize) * len : 0;

  const commonPatterns = [/^12345/, /password/i, /qwerty/i, /abc123/i, /letmein/i, /^admin/i];
  const hasCommonPattern = commonPatterns.some((p) => p.test(input));
  const hasRepeats = /(.)\1{2,}/.test(input);
  const isSequential = /(?:012|123|234|345|456|567|678|789|abc|bcd|cde)/i.test(input);

  let score = 0;
  if (len >= 8) score++;
  if (len >= 12) score++;
  if (len >= 16) score++;
  score += varietyCount - 1;
  if (hasCommonPattern) score -= 2;
  if (hasRepeats) score -= 1;
  if (isSequential) score -= 1;
  score = Math.max(0, Math.min(6, score));

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong", "Excellent"];
  const label = labels[score];

  const notes: string[] = [];
  if (len < 8) notes.push("Too short — use at least 8 characters");
  if (!hasUpper) notes.push("Add uppercase letters");
  if (!hasLower) notes.push("Add lowercase letters");
  if (!hasDigit) notes.push("Add numbers");
  if (!hasSymbol) notes.push("Add symbols");
  if (hasCommonPattern) notes.push("Avoid common words/patterns");
  if (hasRepeats) notes.push("Avoid repeated characters");
  if (isSequential) notes.push("Avoid sequential characters");

  return [
    `Strength:  ${label} (${score}/6)`,
    `Length:    ${len} characters`,
    `Entropy:   ~${entropy.toFixed(1)} bits`,
    `Variety:   ${[hasLower && "lowercase", hasUpper && "uppercase", hasDigit && "digits", hasSymbol && "symbols"].filter(Boolean).join(", ") || "none"}`,
    notes.length ? `\nSuggestions:\n${notes.map((n) => `- ${n}`).join("\n")}` : "\n✓ No suggestions — looks solid.",
  ].join("\n");
}

// --- Regex to Code Snippet ---
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

// --- Commit Message Formatter ---
function formatCommitMessage(input: string, type: CommitType, scope: string, breaking: boolean): string {
  if (!input.trim()) throw new Error("Enter a short commit description");
  const desc = input.trim().replace(/\.$/, "");
  const scopePart = scope.trim() ? `(${scope.trim()})` : "";
  const bang = breaking ? "!" : "";
  return `${type}${scopePart}${bang}: ${desc}`;
}

// --- package.json Validator ---
function validatePackageJson(input: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch (e) {
    throw new Error("Invalid JSON: " + (e instanceof Error ? e.message : ""));
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) throw new Error("package.json must be a JSON object");
  const obj = data as Record<string, unknown>;
  const issues: string[] = [];
  if (!obj.name) issues.push("Missing required field: name");
  else if (typeof obj.name === "string" && !/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(obj.name)) {
    issues.push('"name" contains invalid characters for an npm package name');
  }
  if (!obj.version) issues.push("Missing required field: version");
  else if (typeof obj.version === "string" && !/^\d+\.\d+\.\d+/.test(obj.version)) issues.push('"version" should follow semver (e.g. 1.0.0)');
  if (obj.dependencies && typeof obj.dependencies !== "object") issues.push('"dependencies" must be an object');
  if (obj.scripts && typeof obj.scripts !== "object") issues.push('"scripts" must be an object');
  if (obj.main && typeof obj.main !== "string") issues.push('"main" must be a string');
  if (obj.dependencies && obj.devDependencies) {
    for (const k of Object.keys(obj.dependencies as object)) {
      if (k in (obj.devDependencies as object)) issues.push(`"${k}" listed in both dependencies and devDependencies`);
    }
  }
  const formatted = JSON.stringify(obj, null, 2);
  const report = issues.length ? `Found ${issues.length} issue(s):\n${issues.map((i) => `✗ ${i}`).join("\n")}` : "✓ No issues found.";
  return `${report}\n\n// Formatted:\n${formatted}`;
}

// --- Dockerfile Linter ---
function lintDockerfile(input: string): string {
  if (!input.trim()) throw new Error("Paste Dockerfile content");
  const lines = input.split("\n");
  const issues: string[] = [];
  let sawFrom = false;

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const instruction = line.split(/\s+/)[0].toUpperCase();
    if (instruction === "FROM") {
      sawFrom = true;
      const image = line.split(/\s+/)[1] || "";
      if (/:latest\b/.test(line) || !image.includes(":")) {
        issues.push(`Line ${idx + 1}: pin a specific tag instead of ":latest" or an untagged image`);
      }
    } else if (!sawFrom && instruction !== "ARG") {
      issues.push(`Line ${idx + 1}: "${instruction}" appears before any FROM instruction`);
    }
    if (instruction === "RUN" && /apt-get install/.test(line) && !/apt-get update/.test(input)) {
      issues.push(`Line ${idx + 1}: "apt-get install" without a preceding "apt-get update" can use a stale cache`);
    }
    if (instruction === "ADD" && !/https?:\/\//.test(line)) {
      issues.push(`Line ${idx + 1}: prefer COPY over ADD for local files (ADD has extra, often-unwanted behavior)`);
    }
    if (instruction === "MAINTAINER") {
      issues.push(`Line ${idx + 1}: MAINTAINER is deprecated — use a LABEL instead`);
    }
  });

  if (!sawFrom) issues.unshift("No FROM instruction found");

  return issues.length
    ? `Found ${issues.length} issue(s):\n\n${issues.map((i) => `✗ ${i}`).join("\n")}`
    : "✓ No issues found — Dockerfile looks reasonable.";
}

// --- Semver Parser / Comparator ---
function parseSemver(v: string): { major: number; minor: number; patch: number; prerelease: string; build: string } {
  const m = v.trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/);
  if (!m) throw new Error(`"${v}" is not a valid semver version`);
  return { major: +m[1], minor: +m[2], patch: +m[3], prerelease: m[4] || "", build: m[5] || "" };
}

function semverParseTool(input: string): string {
  const v = parseSemver(input);
  return [
    `Major:      ${v.major}`,
    `Minor:      ${v.minor}`,
    `Patch:      ${v.patch}`,
    `Prerelease: ${v.prerelease || "none"}`,
    `Build:      ${v.build || "none"}`,
  ].join("\n");
}

function compareSemverParsed(a: ReturnType<typeof parseSemver>, b: ReturnType<typeof parseSemver>): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  if (!a.prerelease && b.prerelease) return 1;
  if (a.prerelease && !b.prerelease) return -1;
  if (a.prerelease && b.prerelease) return a.prerelease.localeCompare(b.prerelease);
  return 0;
}

function semverCompareTool(input: string): string {
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length !== 2) throw new Error("Enter two versions separated by a comma, e.g. 1.2.3, 1.3.0");
  const a = parseSemver(parts[0]);
  const b = parseSemver(parts[1]);
  const cmp = compareSemverParsed(a, b);
  return cmp === 0
    ? `${parts[0]} is equal to ${parts[1]}`
    : cmp > 0
      ? `${parts[0]} is greater than ${parts[1]}`
      : `${parts[0]} is less than ${parts[1]}`;
}

// --- CSS Specificity Calculator ---
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

// --- IP Subnet / CIDR Calculator ---
function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) throw new Error(`"${ip}" is not a valid IPv4 address`);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

function subnetCalc(input: string): string {
  const trimmed = input.trim();
  const m = trimmed.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
  if (!m) throw new Error("Enter a CIDR like 192.168.1.0/24");
  const prefix = Number(m[2]);
  if (prefix < 0 || prefix > 32) throw new Error("Prefix must be between 0 and 32");
  const ipInt = ipToInt(m[1]);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = ipInt & mask;
  const broadcast = network | (~mask >>> 0);
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? totalHosts : Math.max(0, totalHosts - 2);
  return [
    `Network Address:   ${intToIp(network)}`,
    `Broadcast Address: ${intToIp(broadcast)}`,
    `Subnet Mask:       ${intToIp(mask)}`,
    `Prefix:            /${prefix}`,
    `Total Addresses:   ${totalHosts}`,
    `Usable Hosts:      ${usableHosts}`,
    `First Usable:      ${prefix >= 31 ? intToIp(network) : intToIp(network + 1)}`,
    `Last Usable:       ${prefix >= 31 ? intToIp(broadcast) : intToIp(broadcast - 1)}`,
  ].join("\n");
}

// --- MIME Type <-> Extension ---
const MIME_MAP: Record<string, string> = {
  html: "text/html", htm: "text/html", css: "text/css", js: "application/javascript", json: "application/json",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", webp: "image/webp",
  pdf: "application/pdf", zip: "application/zip", txt: "text/plain", csv: "text/csv", xml: "application/xml",
  mp3: "audio/mpeg", mp4: "video/mp4", wav: "audio/wav", woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf",
  doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  gz: "application/gzip", tar: "application/x-tar", ico: "image/x-icon", md: "text/markdown", yaml: "application/x-yaml", yml: "application/x-yaml",
};

function mimeExtToType(input: string): string {
  const ext = input.trim().replace(/^\./, "").toLowerCase();
  if (!ext) throw new Error("Enter a file extension, e.g. json");
  const type = MIME_MAP[ext];
  if (!type) throw new Error(`No known MIME type for ".${ext}"`);
  return type;
}

function mimeTypeToExt(input: string): string {
  const type = input.trim().toLowerCase();
  if (!type) throw new Error("Enter a MIME type, e.g. application/json");
  const matches = Object.entries(MIME_MAP)
    .filter(([, v]) => v === type)
    .map(([k]) => `.${k}`);
  if (!matches.length) throw new Error(`No known extension for "${type}"`);
  return matches.join(", ");
}

// --- HTTP Status Code Lookup ---
const HTTP_STATUS: Record<string, string> = {
  "100": "Continue", "101": "Switching Protocols",
  "200": "OK", "201": "Created", "202": "Accepted", "204": "No Content",
  "301": "Moved Permanently", "302": "Found", "304": "Not Modified", "307": "Temporary Redirect", "308": "Permanent Redirect",
  "400": "Bad Request", "401": "Unauthorized", "403": "Forbidden", "404": "Not Found", "405": "Method Not Allowed",
  "408": "Request Timeout", "409": "Conflict", "410": "Gone", "418": "I'm a teapot", "422": "Unprocessable Entity", "429": "Too Many Requests",
  "500": "Internal Server Error", "501": "Not Implemented", "502": "Bad Gateway", "503": "Service Unavailable", "504": "Gateway Timeout",
};

const HTTP_STATUS_DESC: Record<string, string> = {
  "200": "The request succeeded.",
  "201": "The request succeeded and a new resource was created.",
  "204": "The request succeeded but there is no content to return.",
  "301": "The resource has permanently moved to a new URL.",
  "302": "The resource temporarily resides at a different URL.",
  "304": "The resource hasn't changed since the last request.",
  "400": "The server couldn't understand the request due to invalid syntax.",
  "401": "Authentication is required and has failed or not been provided.",
  "403": "The server understood the request but refuses to authorize it.",
  "404": "The requested resource couldn't be found.",
  "405": "The HTTP method isn't allowed for this resource.",
  "409": "The request conflicts with the current state of the resource.",
  "429": "Too many requests have been sent in a given time.",
  "500": "The server encountered an unexpected condition.",
  "502": "The server received an invalid response from an upstream server.",
  "503": "The server is currently unable to handle the request.",
  "504": "The server didn't receive a timely response from an upstream server.",
};

function httpStatusLookup(input: string): string {
  const code = input.trim().match(/\d{3}/)?.[0];
  if (!code) throw new Error("Enter an HTTP status code, e.g. 404");
  const label = HTTP_STATUS[code];
  if (!label) throw new Error(`Unknown status code "${code}"`);
  const category =
    code[0] === "1" ? "Informational" : code[0] === "2" ? "Success" : code[0] === "3" ? "Redirection" : code[0] === "4" ? "Client Error" : "Server Error";
  const desc = HTTP_STATUS_DESC[code];
  return [`${code} ${label}`, `Category: ${category}`, desc ? `\n${desc}` : ""].filter(Boolean).join("\n");
}

// --- Number <-> Words ---
const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES = ["", "thousand", "million", "billion", "trillion"];

function threeDigitsToWords(n: number): string {
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(ONES[Math.floor(n / 100)] + " hundred");
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : ""));
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(" ");
}

function numberToWords(input: string): string {
  const n = Number(input.trim().replace(/,/g, ""));
  if (!Number.isFinite(n) || !Number.isInteger(n)) throw new Error("Enter a whole number");
  if (n === 0) return "zero";
  if (Math.abs(n) >= 10 ** 15) throw new Error("Number is too large to convert");
  const negative = n < 0;
  let abs = Math.abs(n);
  const groups: string[] = [];
  let scaleIdx = 0;
  while (abs > 0) {
    const chunk = abs % 1000;
    if (chunk) groups.unshift(threeDigitsToWords(chunk) + (SCALES[scaleIdx] ? " " + SCALES[scaleIdx] : ""));
    abs = Math.floor(abs / 1000);
    scaleIdx++;
  }
  return (negative ? "negative " : "") + groups.join(" ");
}

const WORD_NUMBERS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, thousand: 1000, million: 1000000, billion: 1000000000,
};

function wordsToNumber(input: string): string {
  const words = input
    .trim()
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/,/g, " ")
    .replace(/\band\b/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) throw new Error("Enter a number in words, e.g. 'one hundred twenty three'");
  let negative = false;
  if (words[0] === "negative" || words[0] === "minus") {
    negative = true;
    words.shift();
  }
  let total = 0;
  let current = 0;
  for (const w of words) {
    const val = WORD_NUMBERS[w];
    if (val === undefined) throw new Error(`"${w}" isn't a recognized number word`);
    if (val === 100) current *= val;
    else if (val >= 1000) {
      total += current * val;
      current = 0;
    } else current += val;
  }
  const result = total + current;
  return String(negative ? -result : result);
}

// --- Base36 Encode/Decode ---
function base36Encode(input: string): string {
  if (!input) throw new Error("Enter text to encode");
  const bytes = new TextEncoder().encode(input);
  let num = 0n;
  for (const b of bytes) num = num * 256n + BigInt(b);
  return num.toString(36);
}

function base36Decode(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed || !/^[0-9a-z]+$/.test(trimmed)) throw new Error("Enter valid Base36 text (0-9, a-z)");
  let num = 0n;
  for (const ch of trimmed) num = num * 36n + BigInt(parseInt(ch, 36));
  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num % 256n));
    num /= 256n;
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// --- Mocking Case Converter ---
function mockingCase(input: string): string {
  if (!input) throw new Error("Enter text to convert");
  let upper = false;
  return Array.from(input)
    .map((ch) => {
      if (!/[a-zA-Z]/.test(ch)) return ch;
      const out = upper ? ch.toUpperCase() : ch.toLowerCase();
      upper = !upper;
      return out;
    })
    .join("");
}


// ===========================================================================
// Batch 5 tools
// ===========================================================================

// --- Tailwind CSS Class Sorter ---
const TAILWIND_ORDER: string[] = [
  "container", "columns-", "break-after-", "break-before-", "break-inside-", "box-decoration-", "box-",
  "float-", "clear-", "isolate", "isolation-", "object-", "overflow-", "overscroll-",
  "static", "fixed", "absolute", "relative", "sticky",
  "inset-", "top-", "right-", "bottom-", "left-", "start-", "end-",
  "visible", "invisible", "collapse", "z-",
  "flex-", "flex", "basis-", "grow", "shrink", "order-",
  "grid-", "col-", "row-", "auto-cols-", "auto-rows-", "gap-",
  "justify-", "content-", "items-", "self-", "place-",
  "space-x-", "space-y-", "m-", "mx-", "my-", "mt-", "mr-", "mb-", "ml-", "ms-", "me-",
  "p-", "px-", "py-", "pt-", "pr-", "pb-", "pl-", "ps-", "pe-",
  "w-", "min-w-", "max-w-", "h-", "min-h-", "max-h-", "size-",
  "font-", "text-", "leading-", "tracking-", "antialiased", "italic", "not-italic",
  "underline", "overline", "line-through", "no-underline", "uppercase", "lowercase", "capitalize", "normal-case",
  "truncate", "whitespace-", "break-", "indent-", "align-", "list-",
  "bg-",
  "rounded", "border", "divide-", "outline", "ring",
  "shadow", "opacity-", "mix-blend-", "bg-blend-",
  "blur", "brightness-", "contrast-", "drop-shadow", "grayscale", "hue-rotate-", "invert", "saturate-", "sepia",
  "backdrop-",
  "transition", "duration-", "ease-", "delay-", "animate-",
  "scale-", "rotate-", "translate-", "skew-", "transform", "origin-",
  "cursor-", "select-", "resize", "scroll-", "touch-", "pointer-events-", "will-change-",
  "fill-", "stroke-",
  "sr-only", "not-sr-only",
];

function tailwindClassRank(baseClass: string): number {
  for (let i = 0; i < TAILWIND_ORDER.length; i++) {
    const prefix = TAILWIND_ORDER[i];
    if (baseClass === prefix || baseClass.startsWith(prefix)) return i;
  }
  return TAILWIND_ORDER.length;
}

function sortTailwindClasses(input: string): string {
  if (!input.trim()) throw new Error("Paste a class list");
  const classes = input.trim().split(/\s+/);
  const decorated = classes.map((cls, idx) => {
    const lastColon = cls.lastIndexOf(":");
    const base = lastColon >= 0 ? cls.slice(lastColon + 1) : cls;
    const variant = lastColon >= 0 ? cls.slice(0, lastColon) : "";
    const cleanBase = base.startsWith("!") ? base.slice(1) : base;
    return { cls, idx, variant, rank: tailwindClassRank(cleanBase) };
  });
  decorated.sort((a, b) => {
    if (a.variant !== b.variant) {
      if (!a.variant) return -1;
      if (!b.variant) return 1;
      return a.variant.localeCompare(b.variant);
    }
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.idx - b.idx;
  });
  return decorated.map((d) => d.cls).join(" ");
}

// --- Regex to Plain English ---
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

// --- JSON to Zod Schema ---
function jsonToZod(input: string, rootName: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON");
  }

  function zodFor(value: unknown): string {
    if (value === null) return "z.null()";
    if (Array.isArray(value)) {
      if (value.length === 0) return "z.array(z.unknown())";
      return `z.array(${zodFor(value[0])})`;
    }
    const t = typeof value;
    if (t === "string") return "z.string()";
    if (t === "number") return "z.number()";
    if (t === "boolean") return "z.boolean()";
    if (t === "object") {
      const entries = Object.entries(value as Record<string, unknown>).map(([k, v]) => {
        const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : `"${k}"`;
        return `  ${safeKey}: ${zodFor(v)},`;
      });
      return `z.object({\n${entries.join("\n")}\n})`;
    }
    return "z.unknown()";
  }

  const name = (rootName || "schema").replace(/[^a-zA-Z0-9_]/g, "") || "schema";
  const typeName = name.charAt(0).toUpperCase() + name.slice(1);
  return `import { z } from "zod";\n\nexport const ${name} = ${zodFor(data)};\n\nexport type ${typeName} = z.infer<typeof ${name}>;`;
}

// --- JSON to GraphQL SDL ---
function jsonToGraphQL(input: string, typeName: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON");
  }
  const sample = Array.isArray(data) ? data[0] : data;
  if (typeof sample !== "object" || sample === null) throw new Error("Top-level JSON must be an object (or array of objects)");

  const types: string[] = [];
  const seen = new Set<string>();

  function capitalize(s: string): string {
    const clean = s.replace(/[^a-zA-Z0-9]/g, " ").trim().split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
    return clean || "Field";
  }

  function gqlType(value: unknown, name: string): string {
    if (value === null) return "String";
    if (Array.isArray(value)) return `[${gqlType(value[0] ?? "", name)}]`;
    const t = typeof value;
    if (t === "string") return "String";
    if (t === "boolean") return "Boolean";
    if (t === "number") return Number.isInteger(value) ? "Int" : "Float";
    if (t === "object") {
      const iName = capitalize(name);
      buildType(value as Record<string, unknown>, iName);
      return iName;
    }
    return "String";
  }

  function buildType(obj: Record<string, unknown>, name: string) {
    if (seen.has(name)) return;
    seen.add(name);
    const lines = [`type ${name} {`];
    for (const [k, v] of Object.entries(obj)) lines.push(`  ${k}: ${gqlType(v, k)}`);
    lines.push("}");
    types.push(lines.join("\n"));
  }

  buildType(sample as Record<string, unknown>, capitalize(typeName || "Root"));
  return types.join("\n\n");
}

// --- JSON to OpenAPI Schema ---
function jsonToOpenApiSchema(input: string): string {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON");
  }

  function schemaFor(value: unknown): Record<string, unknown> {
    if (value === null) return { type: "string", nullable: true };
    if (Array.isArray(value)) return { type: "array", items: value.length ? schemaFor(value[0]) : {} };
    const t = typeof value;
    if (t === "string") return { type: "string", example: value };
    if (t === "boolean") return { type: "boolean", example: value };
    if (t === "number") return { type: Number.isInteger(value) ? "integer" : "number", example: value };
    if (t === "object") {
      const properties: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) properties[k] = schemaFor(v);
      return { type: "object", properties, required: Object.keys(value as object) };
    }
    return { type: "string" };
  }

  return JSON.stringify(schemaFor(data), null, 2);
}

// --- GraphQL Formatter / Minifier ---
function formatGraphQL(input: string): string {
  if (!input.trim()) throw new Error("Paste a GraphQL query");
  let depth = 0;
  const lines: string[] = [];
  let current = "";
  const flush = () => {
    const trimmed = current.trim();
    if (trimmed) lines.push("  ".repeat(depth) + trimmed);
    current = "";
  };
  for (const ch of input.replace(/\s+/g, " ").trim()) {
    if (ch === "{") {
      current += " {";
      flush();
      depth++;
    } else if (ch === "}") {
      flush();
      depth = Math.max(0, depth - 1);
      lines.push("  ".repeat(depth) + "}");
    } else {
      current += ch;
    }
  }
  flush();
  return lines.filter(Boolean).join("\n");
}

function minifyGraphQL(input: string): string {
  if (!input.trim()) throw new Error("Paste a GraphQL query");
  return input.replace(/\s+/g, " ").replace(/\s*([{}():,])\s*/g, "$1").trim();
}

// --- Diceware / Passphrase Generator ---
const DICEWARE_WORDS = [
  "apple","river","stone","cloud","tiger","maple","ocean","spark","brave","gentle","amber","ember","hazel","willow","meadow",
  "canyon","desert","forest","glacier","harbor","island","jungle","kettle","lantern","marble","nectar","orchid","pebble","quartz","ribbon",
  "sapphire","thunder","umbrella","velvet","walnut","xenon","yonder","zephyr","anchor","breeze","cactus","dawn","echo","falcon","garden",
  "horizon","ivory","jasper","kernel","lagoon","mint","nutmeg","opal","pepper","quill","raven","summit","timber","urchin","violet",
  "wander","yarrow","zenith","autumn","blossom","cedar","dune","ember2","fable","glow","haven","ink","jubilee","knoll","lumen",
  "mirage","nook","onyx","pine","quiver","ridge","shard","tundra","utopia","vapor","wisp","yield","zeal","alder","brook",
  "coral","dusk","fern","grove","hollow","ivy","juniper","kindle","lark","moss","nimbus","oak","prairie","quartzite","reef",
  "spruce","thicket","under","vine","whisper","yew","zodiac","basil","clover","drift","elm","frost","gale","heron","iris",
  "jade","kiwi","lilac","myrtle","nectarine","olive","plum","quince","rowan","sage","tulip","umber","vista","wheat","yucca",
  "cinder","dapple","flint","granite","haze","indigo","jetty","knot","lattice","mesa","nova","onward","pixel","quaint","rustle",
  "silver","tangle","upland","verve","woven","yolk","zigzag","acorn","birch","copper","daisy","evergreen","fjord","gully","hush",
];

function generatePassphrase(wordCount: number, separator: string, capitalize: boolean, includeNumber: boolean): string {
  const n = Math.max(2, Math.min(Math.round(wordCount), 10));
  const arr = new Uint32Array(n + (includeNumber ? 1 : 0));
  crypto.getRandomValues(arr);
  const words: string[] = [];
  for (let i = 0; i < n; i++) {
    let w = DICEWARE_WORDS[arr[i] % DICEWARE_WORDS.length];
    if (capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
    words.push(w);
  }
  if (includeNumber) words.push(String(arr[n] % 100));
  return words.join(separator || "-");
}

// --- ULID Generator ---
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function ulidEncodeTime(time: number, len: number): string {
  let str = "";
  for (let i = len - 1; i >= 0; i--) {
    const mod = time % 32;
    str = CROCKFORD[mod] + str;
    time = (time - mod) / 32;
  }
  return str;
}

function ulidEncodeRandom(len: number): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let str = "";
  for (let i = 0; i < len; i++) str += CROCKFORD[bytes[i] % 32];
  return str;
}

function generateUlid(): string {
  return ulidEncodeTime(Date.now(), 10) + ulidEncodeRandom(16);
}

function generateUlids(count: number): string {
  const n = Math.max(1, Math.min(Math.round(count), 100));
  return Array.from({ length: n }, () => generateUlid()).join("\n");
}

// --- Color Palette Generator ---
function parseHexColor(hex: string): { r: number; g: number; b: number } {
  const clean = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean) && !/^[0-9a-fA-F]{3}$/.test(clean)) throw new Error("Enter a valid hex color, e.g. #3b82f6");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
}

function rgbToHslTuple(r: number, g: number, b: number): [number, number, number] {
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
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generatePalette(input: string, scheme: PaletteScheme): string {
  const { r, g, b } = parseHexColor(input);
  const [h, s, l] = rgbToHslTuple(r, g, b);
  let hues: number[];
  if (scheme === "complementary") hues = [h, h + 180];
  else if (scheme === "analogous") hues = [h - 30, h, h + 30];
  else if (scheme === "triadic") hues = [h, h + 120, h + 240];
  else hues = [h, h + 90, h + 180, h + 270];
  return hues.map((hue) => hslToHex(hue, s, l)).join("\n");
}

// --- CSS Fluid Type Calculator ---
function fluidTypeCalc(minSizeStr: string, maxSize: number, minVw: number, maxVw: number): string {
  const minSize = Number(minSizeStr.trim());
  if (isNaN(minSize)) throw new Error("Enter the minimum font size in px");
  if (minVw >= maxVw) throw new Error("Max viewport must be greater than min viewport");
  const slope = (maxSize - minSize) / (maxVw - minVw);
  const yIntersect = -minVw * slope + minSize;
  const slopeVw = (slope * 100).toFixed(4);
  const remMin = (minSize / 16).toFixed(4);
  const remMax = (maxSize / 16).toFixed(4);
  const remIntersect = (yIntersect / 16).toFixed(4);
  return `font-size: clamp(${remMin}rem, calc(${remIntersect}rem + ${slopeVw}vw), ${remMax}rem);\n\n/* min: ${minSize}px at ${minVw}px viewport */\n/* max: ${maxSize}px at ${maxVw}px viewport */`;
}

// --- Emoji Shortcode Converter ---
const EMOJI_MAP: Record<string, string> = {
  smile: "😄", grin: "😁", joy: "😂", heart: "❤️", thumbsup: "👍", thumbsdown: "👎",
  fire: "🔥", star: "⭐", tada: "🎉", rocket: "🚀", eyes: "👀", clap: "👏",
  cry: "😢", laughing: "😆", wink: "😉", thinking: "🤔", hundred: "💯", pray: "🙏",
  wave: "👋", ok_hand: "👌", muscle: "💪", sparkles: "✨", warning: "⚠️", checkmark: "✅",
  x: "❌", bulb: "💡", bug: "🐛", rainbow: "🌈", sun: "☀️", moon: "🌙",
  coffee: "☕", pizza: "🍕", beer: "🍺", cake: "🎂", gift: "🎁", zap: "⚡",
  skull: "💀", ghost: "👻", alien: "👽", robot: "🤖", poop: "💩", heart_eyes: "😍",
  sob: "😭", angry: "😠", sunglasses: "😎", scream: "😱", clock: "🕐", calendar: "📅",
  email: "📧", phone: "📱", computer: "💻", lock: "🔒", key: "🔑", flag: "🚩",
};

function shortcodeToEmoji(input: string): string {
  if (!input) throw new Error("Enter text with :shortcode: patterns");
  return input.replace(/:([a-zA-Z0-9_+-]+):/g, (match, code) => EMOJI_MAP[code] ?? match);
}

function emojiToShortcode(input: string): string {
  if (!input) throw new Error("Enter text containing emoji");
  let out = input;
  for (const [code, emoji] of Object.entries(EMOJI_MAP)) out = out.split(emoji).join(`:${code}:`);
  return out;
}

// --- .htaccess to Nginx ---
function htaccessToNginx(input: string): string {
  if (!input.trim()) throw new Error("Paste .htaccess content");
  const lines = input.split("\n");
  const out: string[] = [];
  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const parts = line.split(/\s+/);
    const directive = parts[0];

    if (directive === "RewriteEngine") return;
    if (directive === "DirectoryIndex") out.push(`index ${parts.slice(1).join(" ")};`);
    else if (directive === "ErrorDocument") out.push(`error_page ${parts[1]} ${parts.slice(2).join(" ")};`);
    else if (directive === "Redirect" || directive === "Redirect301") out.push(`rewrite ^${parts[1]}$ ${parts[2]} permanent;`);
    else if (directive === "RedirectMatch") out.push(`rewrite ${parts[1]} ${parts[2]} permanent;`);
    else if (directive === "RewriteRule") {
      const [, pattern, target, flags] = parts;
      const isRedirect = flags && /R(=\d+)?/.test(flags);
      out.push(`rewrite ${pattern} ${target}${isRedirect ? " permanent" : ""};`);
    } else if (directive === "RewriteCond") out.push(`# condition (verify manually): ${line}`);
    else if (directive === "Deny" || directive === "Require") out.push(`# access control (verify manually): ${line}`);
    else if (directive === "Options" && /-Indexes/.test(line)) out.push(`autoindex off;`);
    else if (directive === "AddType") out.push(`# add to nginx mime.types or: types { ${parts[1]} ${parts.slice(2).join(" ")}; }`);
    else if (directive === "<IfModule" || directive === "</IfModule>") return;
    else out.push(`# unrecognized (manual conversion needed): ${line}`);
  });
  return out.length ? out.join("\n") : "# No recognizable directives found";
}

// --- Docker Compose Validator ---
function validateDockerCompose(input: string): string {
  if (!input.trim()) throw new Error("Paste docker-compose.yml content");
  let data: unknown;
  try {
    data = loadYaml(input);
  } catch (e) {
    throw new Error("Invalid YAML: " + (e instanceof Error ? e.message : ""));
  }
  if (typeof data !== "object" || data === null) throw new Error("Top-level content must be a YAML mapping");
  const obj = data as Record<string, unknown>;
  const issues: string[] = [];
  if (!obj.services) issues.push("Missing top-level 'services' key");
  else if (typeof obj.services === "object") {
    for (const [name, svc] of Object.entries(obj.services as Record<string, unknown>)) {
      if (typeof svc !== "object" || svc === null) {
        issues.push(`Service "${name}": must be a mapping`);
        continue;
      }
      const s = svc as Record<string, unknown>;
      if (!s.image && !s.build) issues.push(`Service "${name}": needs either "image" or "build"`);
      if (s.ports && !Array.isArray(s.ports)) issues.push(`Service "${name}": "ports" should be a list`);
      if (s.environment && typeof s.environment !== "object") issues.push(`Service "${name}": "environment" should be a list or mapping`);
    }
  }
  return issues.length
    ? `Found ${issues.length} issue(s):\n\n${issues.map((i) => `✗ ${i}`).join("\n")}`
    : "✓ No issues found — docker-compose.yml looks reasonable.";
}

// --- JWK to PEM ---
async function jwkToPem(input: string): Promise<string> {
  let jwk: JsonWebKey;
  try {
    jwk = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JWK JSON");
  }
  if (!jwk.kty) throw new Error('JWK must include a "kty" field');

  let algorithm: RsaHashedImportParams | EcKeyImportParams;
  if (jwk.kty === "RSA") algorithm = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
  else if (jwk.kty === "EC") algorithm = { name: "ECDSA", namedCurve: (jwk.crv as string) || "P-256" };
  else throw new Error(`Unsupported key type "${jwk.kty}" — only RSA and EC are supported`);

  const isPrivate = !!jwk.d;
  const usages: KeyUsage[] = isPrivate ? ["sign"] : ["verify"];
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey("jwk", jwk, algorithm, true, usages);
  } catch (e) {
    throw new Error("Couldn't import this JWK: " + (e instanceof Error ? e.message : ""));
  }

  const format = isPrivate ? "pkcs8" : "spki";
  const exported = await crypto.subtle.exportKey(format, key);
  const b64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  const lines = b64.match(/.{1,64}/g) || [];
  const label = isPrivate ? "PRIVATE KEY" : "PUBLIC KEY";
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
}

// --- .env Diff ---
function envDiffCheck(input: string): string {
  const delimIdx = input.split("\n").findIndex((l) => l.trim() === "===");
  if (delimIdx === -1) throw new Error('Separate the two .env files with a line containing only "==="');
  const left = input.split("\n").slice(0, delimIdx).join("\n");
  const right = input.split("\n").slice(delimIdx + 1).join("\n");

  const parseEnv = (text: string): Record<string, string> => {
    const result: Record<string, string> = {};
    text.split("\n").forEach((raw) => {
      const line = raw.trim();
      if (!line || line.startsWith("#")) return;
      const eq = line.indexOf("=");
      if (eq === -1) return;
      result[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    });
    return result;
  };

  const a = parseEnv(left);
  const b = parseEnv(right);
  const allKeys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
  const onlyA: string[] = [];
  const onlyB: string[] = [];
  const different: string[] = [];

  for (const key of allKeys) {
    const inA = key in a;
    const inB = key in b;
    if (inA && !inB) onlyA.push(key);
    else if (!inA && inB) onlyB.push(key);
    else if (a[key] !== b[key]) different.push(`${key}: "${a[key]}" ≠ "${b[key]}"`);
  }

  const out: string[] = [];
  out.push(onlyA.length ? `Only in File A:\n${onlyA.map((k) => `  + ${k}`).join("\n")}` : "Only in File A: (none)");
  out.push(onlyB.length ? `\nOnly in File B:\n${onlyB.map((k) => `  + ${k}`).join("\n")}` : "\nOnly in File B: (none)");
  out.push(different.length ? `\nDifferent values:\n${different.map((d) => `  ≠ ${d}`).join("\n")}` : "\nDifferent values: (none)");
  return out.join("\n");
}

// --- Markdown to Slack/Discord ---
function markdownToSlack(input: string): string {
  if (!input.trim()) throw new Error("Enter Markdown text");
  let s = input;
  s = s.replace(/\*\*(.+?)\*\*/g, "*$1*");
  s = s.replace(/__(.+?)__/g, "_$1_");
  s = s.replace(/~~(.+?)~~/g, "~$1~");
  s = s.replace(/\[(.+?)\]\((.+?)\)/g, "<$2|$1>");
  s = s.replace(/^#{1,6}\s+(.+)$/gm, "*$1*");
  s = s.replace(/^[-*]\s+(.+)$/gm, "• $1");
  return s;
}

function markdownToDiscord(input: string): string {
  if (!input.trim()) throw new Error("Enter Markdown text");
  let s = input;
  s = s.replace(/^#{1,6}\s+(.+)$/gm, "**$1**");
  s = s.replace(/\[(.+?)\]\((.+?)\)/g, "$1 (<$2>)");
  return s;
}

// --- CSV to Markdown Table ---
function parseCsvLineForMd(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        result.push(cur);
        cur = "";
      } else cur += c;
    }
  }
  result.push(cur);
  return result;
}

function csvToMarkdownTable(input: string): string {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  if (lines.length < 1) throw new Error("Paste CSV content");
  const rows = lines.map(parseCsvLineForMd);
  const header = rows[0];
  const body = rows.slice(1);
  const out = [`| ${header.join(" | ")} |`, `| ${header.map(() => "---").join(" | ")} |`, ...body.map((r) => `| ${r.join(" | ")} |`)];
  return out.join("\n");
}

// --- API Rate Limit Calculator ---
function rateLimitCalc(usedStr: string, limit: number, windowMinutes: number): string {
  const used = Number(usedStr.trim());
  if (isNaN(used) || used < 0) throw new Error("Enter the number of requests used so far");
  if (limit <= 0 || windowMinutes <= 0) throw new Error("Limit and window must be positive");
  const remaining = Math.max(0, limit - used);
  const windowSeconds = windowMinutes * 60;
  const avgIntervalSeconds = remaining > 0 ? windowSeconds / remaining : 0;
  return [
    `Limit:      ${limit} requests / ${windowMinutes} min`,
    `Used:       ${used}`,
    `Remaining:  ${remaining}`,
    `Window:     ${windowSeconds}s`,
    remaining > 0
      ? `Safe pace:  1 request every ~${avgIntervalSeconds.toFixed(1)}s to use the rest of the window evenly`
      : `Status:     Limit reached — wait for the window to reset`,
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
    case "sql-format":
      return (settings.sqlMode ?? "format") === "minify"
        ? minifySql(input)
        : formatSql(input, settings.sqlKeywordCase ?? "upper", settings.sqlIndent ?? 2);
    case "html-format":
      return (settings.htmlMode ?? "format") === "minify"
        ? minifyHtml(input, settings.htmlCollapseWhitespace ?? true, settings.htmlRemoveComments ?? true)
        : formatHtml(input, settings.htmlIndent ?? 2);
    case "css-format":
      return (settings.cssMode ?? "format") === "minify"
        ? minifyCss(input, settings.cssRemoveComments ?? true)
        : formatCss(input, settings.cssIndent ?? 2);
    case "js-format":
      return (settings.jsMode ?? "format") === "minify"
        ? minifyJs(input, settings.jsMangle ?? true)
        : formatJs(input, settings.jsIndent ?? 2, settings.jsSemi ?? true, settings.jsSingleQuote ?? false);

    // --- batch 2 tools ---
    case "percentage-calc":
      return percentageCalc(input, settings.pctMode ?? "of");
    case "timezone-convert":
      return timezoneConvert(input, settings.fromTz ?? "UTC", settings.toTz ?? "America/New_York");
    case "iso8601-format":
      return iso8601Format(input);
    case "date-diff":
      return dateDifference(input);
    case "roman-numeral":
      return romanNumeral(input, settings.romanDirection ?? "toRoman");
    case "caesar-cipher":
      return caesarCipher(input, settings.caesarShift ?? 13);
    case "morse-code":
      return morseCode(input, settings.morseDirection ?? "encode");
    case "html-entity":
      return htmlEntity(input, settings.entityDirection ?? "encode");
    case "unicode-escape":
      return unicodeEscapeTool(input, settings.unicodeDirection ?? "encode");
    case "binary-text":
      return binaryText(input, settings.binaryDirection ?? "encode");
    case "base32":
      return base32Tool(input, settings.base32Direction ?? "encode");
    case "hmac-gen":
      return hmacGenerate(input, settings.hmacSecret ?? "", settings.hmacAlgo ?? "SHA-256");
    case "url-parse":
      return urlParse(input);
    case "querystring-json":
      return queryStringJson(input, settings.qsDirection ?? "toJson");
    case "ua-parse":
      return userAgentParse(input);

    // --- batch 3 cases ---
    case "json-to-ts":
      return jsonToTs(input, settings.tsInterfaceName ?? "Root");
    case "markdown-to-html":
      return markdownToHtmlConvert(input);
    case "html-to-markdown":
      return htmlToMarkdownConvert(input);
    case "curl-convert":
      return curlConvert(input, settings.curlTarget ?? "fetch");
    case "random-number":
      return randomNumberGenerate(settings.rngMin ?? 1, settings.rngMax ?? 100, settings.rngCount ?? 5);
    case "unit-convert":
      return unitConvertValue(input, settings.unitCategory ?? "length", settings.unitFrom ?? "m", settings.unitTo ?? "ft");
    case "env-parse":
      return envParse(input);
    case "json-to-csv":
      return jsonToCsvConvert(input);
    case "nanoid-gen":
      return nanoidGenerate(settings.nanoidLength ?? 21, settings.nanoidAlphabet ?? "urlsafe");
    case "prime-check":
      return primeCheck(input);
    case "prime-list":
      return primeList(input);
    case "stats-calc":
      return statisticsCalc(input);
    case "ascii-encode":
      return asciiEncode(input);
    case "ascii-decode":
      return asciiDecode(input);
    case "random-color":
      return randomColorGenerate(settings.colorGenFormat ?? "hex", settings.colorGenCount ?? 5);
    case "punycode-encode":
      return punycodeEncode(input);
    case "punycode-decode":
      return punycodeDecode(input);
    case "base58-encode":
      return base58Encode(input);
    case "base58-decode":
      return base58Decode(input);
    case "robots-validate":
      return robotsValidate(input);
    case "crc32":
      return crc32Checksum(input);
    case "git-branch-gen":
      return gitBranchGenerate(input, settings.branchType ?? "feature");
    case "svg-datauri-base64":
      return svgToDataUriBase64(input);
    case "svg-datauri-url":
      return svgToDataUriUrl(input);

    // --- batch 4 cases ---
    case "toml-to-json":
      return tomlToJsonConvert(input);
    case "json-to-toml":
      return jsonToTomlConvert(input);
    case "ini-to-json":
      return iniToJsonConvert(input);
    case "json-to-ini":
      return jsonToIniConvert(input);
    case "password-strength":
      return checkPasswordStrength(input);
    case "regex-to-code":
      return regexToCode(input, settings.codeLang ?? "javascript");
    case "commit-msg-gen":
      return formatCommitMessage(input, settings.commitType ?? "feat", settings.commitScope ?? "", settings.commitBreaking ?? false);
    case "package-json-validate":
      return validatePackageJson(input);
    case "dockerfile-lint":
      return lintDockerfile(input);
    case "semver-parse":
      return semverParseTool(input);
    case "semver-compare":
      return semverCompareTool(input);
    case "css-specificity":
      return cssSpecificity(input);
    case "ip-subnet-calc":
      return subnetCalc(input);
    case "mime-ext-to-type":
      return mimeExtToType(input);
    case "mime-type-to-ext":
      return mimeTypeToExt(input);
    case "http-status-lookup":
      return httpStatusLookup(input);
    case "number-to-words":
      return numberToWords(input);
    case "words-to-number":
      return wordsToNumber(input);
    case "base36-encode":
      return base36Encode(input);
    case "base36-decode":
      return base36Decode(input);
    case "mocking-case":
      return mockingCase(input);

    // --- batch 5 cases ---
    case "tailwind-sort":
      return sortTailwindClasses(input);
    case "regex-explain":
      return explainRegex(input);
    case "json-to-zod":
      return jsonToZod(input, settings.schemaName ?? "schema");
    case "json-to-graphql":
      return jsonToGraphQL(input, settings.gqlTypeName ?? "Root");
    case "json-to-openapi":
      return jsonToOpenApiSchema(input);
    case "graphql-format":
      return formatGraphQL(input);
    case "graphql-minify":
      return minifyGraphQL(input);
    case "passphrase-gen":
      return generatePassphrase(
        settings.passphraseWordCount ?? 4,
        settings.passphraseSeparator ?? "-",
        settings.passphraseCapitalize ?? false,
        settings.passphraseIncludeNumber ?? false
      );
    case "ulid-gen":
      return generateUlids(settings.ulidCount ?? 5);
    case "color-palette-gen":
      return generatePalette(input, settings.paletteScheme ?? "complementary");
    case "fluid-type-calc":
      return fluidTypeCalc(input, settings.fluidMaxSize ?? 32, settings.fluidMinVw ?? 320, settings.fluidMaxVw ?? 1440);
    case "emoji-encode":
      return shortcodeToEmoji(input);
    case "emoji-decode":
      return emojiToShortcode(input);
    case "htaccess-to-nginx":
      return htaccessToNginx(input);
    case "docker-compose-validate":
      return validateDockerCompose(input);
    case "jwk-to-pem":
      return jwkToPem(input);
    case "env-diff":
      return envDiffCheck(input);
    case "md-to-slack":
      return markdownToSlack(input);
    case "md-to-discord":
      return markdownToDiscord(input);
    case "csv-to-md-table":
      return csvToMarkdownTable(input);
    case "rate-limit-calc":
      return rateLimitCalc(input, settings.rateLimitMax ?? 100, settings.rateLimitWindow ?? 60);

    default:
      return input;
  }
}
