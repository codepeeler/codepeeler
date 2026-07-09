// Node categories intentionally reuse the site's existing --cat-* tokens
// (from app/globals.css) wherever the concept overlaps with a landing-page
// tool category, so a workflow node's color always matches its equivalent
// tool card elsewhere on the site. Only two categories have no landing-page
// equivalent: "flow" (start/end nodes — uses --primary directly, no new
// token) and "text" (needs exactly one new token, --cat-text).
export type NodeCat = "flow" | "data" | "encode" | "web" | "text" | "sec" | "gen" | "image";

export const NODE_CAT_COLOR: Record<NodeCat, string> = {
  flow: "var(--primary)",
  data: "var(--cat-data)",
  encode: "var(--cat-encode)",
  web: "var(--cat-web)",
  text: "var(--cat-text)",
  sec: "var(--cat-sec)",
  gen: "var(--cat-gen)",
  image: "var(--cat-image)",
};

export type NodeTypeId =
  | "input"
  | "json-format"
  | "json-minify"
  | "csv-json"
  | "xml-format"
  | "base64-encode"
  | "base64-decode"
  | "url-encode"
  | "url-decode"
  | "uppercase"
  | "lowercase"
  | "word-count"
  | "hash"
  | "jwt-decode"
  | "password-gen"
  | "export"
  // --- newly added node types (bring workspace up to parity with the 42 tool pages) ---
  | "title-case"
  | "sentence-case"
  | "uuid-gen"
  | "regex-test"
  | "qr-gen"
  | "json-tree"
  | "csv-view"
  | "csv-clean"
  | "csv-tsv"
  | "jsonpath"
  | "markdown-preview"
  | "json-yaml"
  | "yaml-lint"
  | "text-sort"
  | "dedupe-lines"
  | "remove-empty-lines"
  | "whitespace-clean"
  | "find-replace"
  | "text-reverse"
  | "slug-gen"
  | "palindrome-check"
  | "text-repeat"
  | "char-freq"
  | "line-number"
  | "text-truncate"
  | "line-shuffle"
  | "readability"
  | "smart-quotes"
  | "random-pick"
  | "lorem-gen"
  // --- new tools ---
  | "unix-timestamp"
  | "cron-parse"
  | "color-convert"
  | "hex-encode"
  | "hex-decode"
  | "css-unit-convert"
  | "http-header-parse"
  | "base-convert"
  | "sql-format"
  | "html-format"
  | "css-format"
  | "js-format";

export const NODE_TYPES: Record<
  NodeTypeId,
  {
    label: string;
    desc: string;
    badge: string;
    cat: NodeCat;
    noInput?: boolean;
    noOutput?: boolean;
  }
> = {
  input: { label: "Input", desc: "Starting value for the workflow", badge: "▶", cat: "flow", noInput: true },
  "json-format": { label: "JSON Formatter", desc: "Format & validate JSON", badge: "{ }", cat: "data" },
  "json-minify": { label: "JSON Minify", desc: "Strip whitespace", badge: "»", cat: "data" },
  "csv-json": { label: "CSV → JSON", desc: "Convert CSV to JSON", badge: "◫", cat: "data" },
  "xml-format": { label: "XML Formatter", desc: "Pretty-print XML", badge: "</>", cat: "data" },
  "base64-encode": { label: "Base64 Encode", desc: "Encode the input", badge: "64", cat: "encode" },
  "base64-decode": { label: "Base64 Decode", desc: "Decode the input", badge: "64", cat: "encode" },
  "url-encode": { label: "URL Encode", desc: "Percent-encode the input", badge: "%", cat: "web" },
  "url-decode": { label: "URL Decode", desc: "Percent-decode the input", badge: "%", cat: "web" },
  uppercase: { label: "Uppercase", desc: "Convert text to UPPERCASE", badge: "AA", cat: "text" },
  lowercase: { label: "Lowercase", desc: "Convert text to lowercase", badge: "aa", cat: "text" },
  "word-count": { label: "Word Count", desc: "Count chars, words, lines", badge: "#", cat: "text" },
  hash: { label: "Hash Generator", desc: "Generate a checksum", badge: "#", cat: "sec" },
  "jwt-decode": { label: "JWT Decoder", desc: "Decode JWT tokens", badge: "JWT", cat: "sec" },
  "password-gen": { label: "Password Generator", desc: "Create strong passwords", badge: "••", cat: "gen" },
  export: { label: "Export", desc: "Save to Collection", badge: "↓", cat: "flow", noOutput: true },

  // --- newly added ---
  "title-case": { label: "Title Case", desc: "Capitalize Each Word", badge: "Aa", cat: "text" },
  "sentence-case": { label: "Sentence case", desc: "Capitalize the first letter of each sentence", badge: "A.", cat: "text" },
  "uuid-gen": { label: "UUID Generator", desc: "Generate a random UUID v4", badge: "id", cat: "gen", noInput: true },
  "regex-test": { label: "Regex Tester", desc: "Test a pattern against the input", badge: ".*", cat: "web" },
  "qr-gen": { label: "QR Generator", desc: "Generate a QR code (data URI)", badge: "▦", cat: "gen" },
  "json-tree": { label: "JSON Tree Viewer", desc: "Explore JSON as an indented tree", badge: "⌂", cat: "data" },
  "csv-view": { label: "CSV Viewer", desc: "Render CSV as an aligned table", badge: "▤", cat: "data" },
  "csv-clean": { label: "CSV Cleaner", desc: "Trim, dedupe & strip empty rows/cols", badge: "✓", cat: "data" },
  "csv-tsv": { label: "CSV ↔ TSV Converter", desc: "Convert between CSV and TSV", badge: "⇥", cat: "data" },
  jsonpath: { label: "JSONPath Tester", desc: "Query JSON with a JSONPath expression", badge: "$.", cat: "data" },
  "markdown-preview": { label: "Markdown Previewer", desc: "Convert Markdown to HTML", badge: "M↓", cat: "data" },
  "json-yaml": { label: "JSON ⇄ YAML", desc: "Convert between JSON and basic YAML", badge: "⇄", cat: "data" },
  "yaml-lint": { label: "YAML Formatter", desc: "Validate & re-indent basic YAML", badge: "Y", cat: "data" },
  "text-sort": { label: "Text Sorter", desc: "Sort lines alphabetically, numerically & more", badge: "↕", cat: "text" },
  "dedupe-lines": { label: "Remove Duplicate Lines", desc: "Strip repeated lines, keep first occurrence", badge: "≠=", cat: "text" },
  "remove-empty-lines": { label: "Remove Empty Lines", desc: "Strip blank/whitespace-only lines", badge: "⌫", cat: "text" },
  "whitespace-clean": { label: "Whitespace Cleaner", desc: "Trim & collapse extra spaces/tabs/blank lines", badge: "⎵", cat: "text" },
  "find-replace": { label: "Find & Replace", desc: "Bulk replace text, with optional regex", badge: "⇄", cat: "text" },
  "text-reverse": { label: "Text Reverser", desc: "Reverse by character, word, or line", badge: "⇋", cat: "text" },
  "slug-gen": { label: "Slug Generator", desc: "Turn titles into URL-safe slugs", badge: "/-/", cat: "text" },
  "palindrome-check": { label: "Palindrome Checker", desc: "Check if text reads the same backwards", badge: "◫◫", cat: "text" },
  "text-repeat": { label: "Text Repeater", desc: "Repeat text N times with a separator", badge: "×N", cat: "text" },
  "char-freq": { label: "Character & Word Frequency", desc: "Rank how often each char/word appears", badge: "▦#", cat: "text" },
  "line-number": { label: "Line Numberer", desc: "Add sequential numbers to each line", badge: "1.", cat: "text" },
  "text-truncate": { label: "Text Truncator", desc: "Truncate by chars or words with a suffix", badge: "…", cat: "text" },
  "line-shuffle": { label: "Line / Word Shuffle", desc: "Randomly shuffle lines or words", badge: "⤨", cat: "text" },
  readability: { label: "Readability Checker", desc: "Flesch score, grade level & reading time", badge: "📖", cat: "text" },
  "smart-quotes": { label: "Typographic Quotes", desc: "Straight ↔ curly quotes, dashes & ellipses", badge: "“”", cat: "text" },
  "random-pick": { label: "Random Line Picker", desc: "Pick one or more random lines", badge: "🎲", cat: "gen" },
  "lorem-gen": { label: "Lorem Ipsum Generator", desc: "Placeholder text by word, sentence or paragraph", badge: "¶", cat: "gen", noInput: true },

  // --- new tools ---
  "unix-timestamp": { label: "Unix Timestamp Converter", desc: "Convert between Unix time and readable dates", badge: "⏱", cat: "gen" },
  "cron-parse": { label: "Cron Parser", desc: "Explain a cron expression & show upcoming runs", badge: "⏲", cat: "gen" },
  "color-convert": { label: "Color Format Converter", desc: "Convert between HEX, RGB & HSL", badge: "◐", cat: "image" },
  "hex-encode": { label: "Hex Encode", desc: "Encode text as hex bytes", badge: "0x", cat: "encode" },
  "hex-decode": { label: "Hex Decode", desc: "Decode hex bytes back to text", badge: "0x", cat: "encode" },
  "css-unit-convert": { label: "CSS Unit Converter", desc: "Convert between px, rem, em & pt", badge: "px", cat: "web" },
  "http-header-parse": { label: "HTTP Header Parser", desc: "Parse raw headers into structured JSON", badge: "H:", cat: "web" },
  "base-convert": { label: "Base Converter", desc: "Convert between binary, octal, decimal & hex", badge: "10₂", cat: "data" },
  "sql-format": { label: "SQL Formatter / Minify", desc: "Beautify or minify a SQL query", badge: "SQL", cat: "data" },
  "html-format": { label: "HTML Formatter / Minify", desc: "Beautify or minify HTML markup", badge: "<>", cat: "data" },
  "css-format": { label: "CSS Formatter / Minify", desc: "Beautify or minify CSS rules", badge: "{ }", cat: "data" },
  "js-format": { label: "JS Formatter / Minify", desc: "Beautify with Prettier or minify with Terser", badge: "JS", cat: "data" },
};

export const PALETTE_GROUPS: { label: string; items: NodeTypeId[] }[] = [
  { label: "Flow", items: ["input", "export"] },
  {
    label: "Data & Formatting",
    items: [
      "json-format",
      "json-minify",
      "csv-json",
      "xml-format",
      "json-tree",
      "csv-view",
      "csv-clean",
      "csv-tsv",
      "jsonpath",
      "markdown-preview",
      "json-yaml",
      "yaml-lint",
      "base-convert",
      "sql-format",
      "html-format",
      "css-format",
      "js-format",
    ],
  },
  { label: "Encode / Decode", items: ["base64-encode", "base64-decode", "hex-encode", "hex-decode"] },
  { label: "Web", items: ["url-encode", "url-decode", "regex-test", "css-unit-convert", "http-header-parse"] },
  {
    label: "Text Tools",
    items: [
      "uppercase",
      "lowercase",
      "title-case",
      "sentence-case",
      "word-count",
      "text-sort",
      "dedupe-lines",
      "remove-empty-lines",
      "whitespace-clean",
      "find-replace",
      "text-reverse",
      "slug-gen",
      "palindrome-check",
      "text-repeat",
      "char-freq",
      "line-number",
      "text-truncate",
      "line-shuffle",
      "readability",
      "smart-quotes",
    ],
  },
  { label: "Security", items: ["hash", "jwt-decode"] },
  { label: "Generator", items: ["password-gen", "uuid-gen", "qr-gen", "lorem-gen", "random-pick"] },
  { label: "Time & Date", items: ["unix-timestamp", "cron-parse"] },
  { label: "Image", items: ["color-convert"] },
];
