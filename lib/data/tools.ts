export type CatKey = "data" | "encode" | "gen" | "web" | "image" | "sec";

export type Tool = {
  id: string;
  name: string;
  desc: string;
  badge: string;
  cat: CatKey;
  page: string | null;
};

export const TOOLS: Tool[] = [
  { id: "json", name: "JSON Formatter / Minify", desc: "Format, validate & minify JSON", badge: "{ }", cat: "data", page: "/tools/json-formatter" },
  { id: "csv-json", name: "CSV to JSON", desc: "Convert CSV rows to JSON", badge: "◫", cat: "data", page: "/tools/csv-to-json" },
  { id: "xml", name: "XML Formatter", desc: "Pretty-print XML", badge: "</>", cat: "data", page: "/tools/xml-formatter" },
  { id: "base64", name: "Base64 Encode/Decode", desc: "Encode & decode strings", badge: "64", cat: "encode", page: "/tools/base64-encoder" },
  { id: "url", name: "URL Encode/Decode", desc: "Percent-encode & decode", badge: "%", cat: "web", page: "/tools/url-encoder" },
  { id: "case", name: "Case Converter", desc: "UPPER, lower, Title, Sentence", badge: "AA", cat: "data", page: "/tools/case-converter" },
  { id: "words", name: "Word Counter", desc: "Chars, words, lines & more", badge: "#", cat: "data", page: "/tools/word-counter" },
  { id: "hash", name: "Hash Generator", desc: "SHA-1 / SHA-256 / SHA-512", badge: "#", cat: "sec", page: "/tools/hash-generator" },
  { id: "jwt", name: "JWT Decoder", desc: "Decode JWT tokens", badge: "JWT", cat: "sec", page: "/tools/jwt-decoder" },
  { id: "uuid", name: "UUID Generator", desc: "Generate random UUIDs", badge: "id", cat: "gen", page: "/tools/uuid-generator" },
  { id: "password", name: "Password Generator", desc: "Create strong passwords", badge: "••", cat: "gen", page: "/tools/password-generator" },
  { id: "regex", name: "Regex Tester", desc: "Test & debug patterns", badge: ".*", cat: "web", page: "/tools/regex-tester" },
  { id: "qr", name: "QR Generator", desc: "Generate QR codes", badge: "▦", cat: "gen", page: "/tools/qr-generator" },
  { id: "color", name: "Color Picker", desc: "Pick & convert colors", badge: "◐", cat: "image", page: null },
  { id: "json-tree", name: "JSON Tree Viewer", desc: "Explore JSON as a collapsible tree", badge: "⌂", cat: "data", page: "/tools/json-tree-viewer" },
  { id: "json-diff", name: "JSON Diff / Compare", desc: "Deep-compare two JSON documents", badge: "⇄", cat: "data", page: "/tools/json-diff" },
  { id: "json-converter", name: "JSON / YAML / XML Converter", desc: "Convert between JSON, YAML & XML", badge: "⇄", cat: "data", page: "/tools/json-converter" },
  { id: "yaml-linter", name: "YAML Formatter & Linter", desc: "Validate & re-indent YAML", badge: "Y", cat: "data", page: "/tools/yaml-linter" },
  { id: "csv-viewer", name: "CSV Viewer", desc: "Browse CSV as a sortable table", badge: "▤", cat: "data", page: "/tools/csv-viewer" },
  { id: "csv-cleaner", name: "CSV Cleaner", desc: "Trim, dedupe & strip empty rows/cols", badge: "✓", cat: "data", page: "/tools/csv-cleaner" },
  { id: "csv-tsv", name: "CSV ↔ TSV Converter", desc: "Convert between CSV and TSV", badge: "⇥", cat: "data", page: "/tools/csv-tsv-converter" },
  { id: "csv-diff", name: "CSV Diff", desc: "Compare two CSVs row by row", badge: "⇅", cat: "data", page: "/tools/csv-diff" },
  { id: "jsonpath", name: "JSONPath Tester", desc: "Query JSON with JSONPath expressions", badge: "$.", cat: "data", page: "/tools/jsonpath-tester" },
  { id: "markdown", name: "Markdown Previewer", desc: "Live GitHub-flavored Markdown preview", badge: "M↓", cat: "data", page: "/tools/markdown-previewer" },
  { id: "text-diff", name: "Text Diff Checker", desc: "Compare text line-by-line or word-by-word", badge: "≠", cat: "data", page: "/tools/text-diff" },
  { id: "text-sorter", name: "Text Sorter", desc: "Sort lines alphabetically, numerically & more", badge: "↕", cat: "data", page: "/tools/text-sorter" },
  { id: "dedupe-lines", name: "Remove Duplicate Lines", desc: "Strip repeated lines, keep first occurrence", badge: "≠=", cat: "data", page: "/tools/remove-duplicate-lines" },
  { id: "empty-lines", name: "Remove Empty Lines", desc: "Strip blank/whitespace-only lines", badge: "⌫", cat: "data", page: "/tools/remove-empty-lines" },
  { id: "whitespace", name: "Whitespace Cleaner", desc: "Trim & collapse extra spaces/tabs/blank lines", badge: "⎵", cat: "data", page: "/tools/whitespace-cleaner" },
  { id: "find-replace", name: "Find & Replace", desc: "Bulk replace text with regex support", badge: "⇄", cat: "data", page: "/tools/find-replace" },
  { id: "text-reverse", name: "Text Reverser", desc: "Reverse by character, word, or line", badge: "⇋", cat: "data", page: "/tools/text-reverser" },
  { id: "slug", name: "Slug Generator", desc: "Turn titles into URL-safe slugs", badge: "/-/", cat: "data", page: "/tools/slug-generator" },
  { id: "lorem", name: "Lorem Ipsum Generator", desc: "Placeholder text by word, sentence or paragraph", badge: "¶", cat: "data", page: "/tools/lorem-ipsum-generator" },
  { id: "palindrome", name: "Palindrome Checker", desc: "Check if text reads the same backwards", badge: "◫◫", cat: "data", page: "/tools/palindrome-checker" },
  { id: "anagram", name: "Anagram Checker", desc: "Check if two phrases are anagrams", badge: "⇌A", cat: "data", page: "/tools/anagram-checker" },
  { id: "text-repeat", name: "Text Repeater", desc: "Repeat text N times with a separator", badge: "×N", cat: "data", page: "/tools/text-repeater" },
  { id: "char-freq", name: "Character & Word Frequency", desc: "Rank how often each char/word appears", badge: "▦#", cat: "data", page: "/tools/character-frequency" },
  { id: "line-numberer", name: "Line Numberer", desc: "Add sequential numbers to each line", badge: "1.", cat: "data", page: "/tools/line-numberer" },
  { id: "text-truncate", name: "Text Truncator", desc: "Truncate by chars or words with a suffix", badge: "…", cat: "data", page: "/tools/text-truncator" },
  { id: "line-shuffle", name: "Line / Word Shuffle", desc: "Randomly shuffle lines or words", badge: "⤨", cat: "data", page: "/tools/line-shuffle" },
  { id: "readability", name: "Readability Checker", desc: "Flesch score, grade level & reading time", badge: "📖", cat: "data", page: "/tools/readability-checker" },
  { id: "smart-quotes", name: "Typographic Quotes Converter", desc: "Straight ↔ curly quotes, dashes & ellipses", badge: "“ ”", cat: "data", page: "/tools/typographic-quotes" },
  { id: "random-pick", name: "Random Line Picker", desc: "Pick one or more random lines from a list", badge: "🎲", cat: "gen", page: "/tools/random-line-picker" },
  // --- new tools ---
  { id: "unix-timestamp", name: "Unix Timestamp Converter", desc: "Convert between Unix time and readable dates", badge: "⏱", cat: "gen", page: "/tools/unix-timestamp-converter" },
  { id: "cron-parser", name: "Cron Expression Parser", desc: "Explain a cron schedule & preview upcoming runs", badge: "⏲", cat: "gen", page: "/tools/cron-parser" },
  { id: "color-convert", name: "Color Format Converter", desc: "Convert between HEX, RGB & HSL", badge: "◐", cat: "image", page: "/tools/color-converter" },
  { id: "color-contrast", name: "Color Contrast Checker", desc: "Check WCAG AA/AAA contrast between two colors", badge: "◐◑", cat: "image", page: "/tools/color-contrast-checker" },
  { id: "hex-encode", name: "Hex Encode/Decode", desc: "Convert text to and from hex bytes", badge: "0x", cat: "encode", page: "/tools/hex-encoder" },
  { id: "css-unit", name: "CSS Unit Converter", desc: "Convert between px, rem, em & pt", badge: "px", cat: "web", page: "/tools/css-unit-converter" },
  { id: "http-header", name: "HTTP Header Parser", desc: "Parse raw HTTP headers into structured JSON", badge: "H:", cat: "web", page: "/tools/http-header-parser" },
  { id: "base-convert", name: "Base Converter", desc: "Convert between binary, octal, decimal & hex", badge: "10₂", cat: "data", page: "/tools/base-converter" },
  { id: "sql-format", name: "SQL Formatter / Minify", desc: "Beautify or minify SQL queries", badge: "SQL", cat: "data", page: "/tools/sql-formatter" },
  { id: "html-format", name: "HTML Formatter / Minify", desc: "Beautify or minify HTML markup", badge: "<>", cat: "data", page: "/tools/html-formatter" },
  { id: "css-format", name: "CSS Formatter / Minify", desc: "Beautify or minify CSS rules", badge: "{ }", cat: "data", page: "/tools/css-formatter" },
];

export const CAT_META: Record<CatKey, { label: string; color: string }> = {
  data: { label: "Data & Formatting", color: "var(--cat-data)" },
  encode: { label: "Encode / Decode", color: "var(--cat-encode)" },
  gen: { label: "Generators", color: "var(--cat-gen)" },
  web: { label: "Web Dev Tools", color: "var(--cat-web)" },
  image: { label: "Image Tools", color: "var(--cat-image)" },
  sec: { label: "Security & API", color: "var(--cat-sec)" },
};

/** Actual tool count per category, always in sync with TOOLS above. */
export function getCategoryCount(cat: CatKey): number {
  return TOOLS.filter((t) => t.cat === cat).length;
}

export const SHORTCUTS: [string, string][] = [
  ["Open search", "⌘ K"],
  ["Command palette", "⌘ /"],
  ["New workspace", "⌘ N"],
  ["Save current file", "⌘ S"],
  ["Duplicate tool tab", "⌘ D"],
  ["Toggle theme", "⌘ J"],
];

export type FlowStep = {
  badge: string;
  cat: CatKey;
  label: string;
  hint: string;
};

export const FLOW: FlowStep[] = [
  { badge: "{ }", cat: "data", label: "JSON Formatter", hint: "Clean up raw JSON" },
  { badge: "»", cat: "data", label: "JSON Minify", hint: "Strip whitespace" },
  { badge: "64", cat: "encode", label: "Base64 Encode", hint: "Encode the result" },
  { badge: "#", cat: "sec", label: "Hash Generator", hint: "Generate a checksum" },
  { badge: "↓", cat: "gen", label: "Export", hint: "Save to Collection" },
];
