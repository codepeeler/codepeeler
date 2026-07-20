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
  { id: "jwt-encoder", name: "JWT Encoder", desc: "Sign JSON payloads into JWTs", badge: "JWT", cat: "sec", page: "/tools/jwt-encoder" },
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
  { id: "js-format", name: "JS Formatter / Minify", desc: "Beautify with Prettier or minify with Terser", badge: "JS", cat: "data", page: "/tools/js-formatter" },
  // --- batch 2 ---
  { id: "percentage-calc", name: "Percentage Calculator", desc: "Percent-of, what-percent & percent change", badge: "%", cat: "gen", page: "/tools/percentage-calculator" },
  { id: "timezone-convert", name: "Timezone Converter", desc: "Convert a date/time between timezones", badge: "🌐", cat: "gen", page: "/tools/timezone-converter" },
  { id: "iso8601-format", name: "ISO 8601 Formatter/Validator", desc: "Validate & format a date as ISO 8601", badge: "📅", cat: "gen", page: "/tools/iso8601-formatter" },
  { id: "date-diff", name: "Date Difference Calculator", desc: "Difference between two dates", badge: "Δd", cat: "gen", page: "/tools/date-difference-calculator" },
  { id: "roman-numeral", name: "Roman Numeral Converter", desc: "Convert between numbers and Roman numerals", badge: "MCM", cat: "data", page: "/tools/roman-numeral-converter" },
  { id: "caesar-cipher", name: "ROT13 / Caesar Cipher", desc: "Shift letters by N positions", badge: "R13", cat: "encode", page: "/tools/rot13-cipher" },
  { id: "morse-code", name: "Morse Code Translator", desc: "Encode & decode Morse code", badge: "•—", cat: "encode", page: "/tools/morse-code-translator" },
  { id: "html-entity", name: "HTML Entity Encode/Decode", desc: "Encode & decode HTML entities", badge: "&;", cat: "encode", page: "/tools/html-entity-encoder" },
  { id: "unicode-escape", name: "Unicode Escape/Unescape", desc: "\\uXXXX escape & unescape text", badge: "\\u", cat: "encode", page: "/tools/unicode-escape" },
  { id: "binary-text", name: "Binary ⇄ Text Converter", desc: "Convert text to and from binary bytes", badge: "01", cat: "encode", page: "/tools/binary-text-converter" },
  { id: "base32", name: "Base32 Encode/Decode", desc: "Encode & decode Base32", badge: "32", cat: "encode", page: "/tools/base32-encoder" },
  { id: "hmac-gen", name: "HMAC Generator", desc: "Sign a message with a secret key", badge: "HMAC", cat: "sec", page: "/tools/hmac-generator" },
  { id: "url-parse", name: "URL Parser", desc: "Break a URL into its components", badge: "URL", cat: "web", page: "/tools/url-parser" },
  { id: "querystring-json", name: "Query String ⇄ JSON", desc: "Convert between a query string and JSON", badge: "?=", cat: "web", page: "/tools/query-string-json-converter" },
  { id: "ua-parse", name: "User-Agent Parser", desc: "Parse browser, OS & device from a UA string", badge: "UA", cat: "web", page: "/tools/user-agent-parser" },
  // --- batch 3 tools ---
  { id: "json-to-ts", name: "JSON to TypeScript", desc: "Generate a TS interface from JSON", badge: "TS", cat: "data", page: "/tools/json-to-typescript" },
  { id: "markdown-html", name: "Markdown ⇄ HTML Converter", desc: "Convert Markdown to HTML and back", badge: "M↔H", cat: "data", page: "/tools/markdown-html-converter" },
  { id: "curl-convert", name: "cURL ⇄ Fetch/Axios Converter", desc: "Turn a curl command into JS request code", badge: "sh", cat: "web", page: "/tools/curl-converter" },
  { id: "random-number", name: "Random Number Generator", desc: "Cryptographically random integers", badge: "0-9", cat: "gen", page: "/tools/random-number-generator" },
  { id: "unit-converter", name: "Unit Converter", desc: "Convert length, weight & data-size units", badge: "⇌", cat: "gen", page: "/tools/unit-converter" },
  { id: "env-parser", name: ".env File Parser / Validator", desc: "Parse .env content & flag issues", badge: ".env", cat: "data", page: "/tools/env-file-parser" },
  { id: "json-to-csv", name: "JSON to CSV", desc: "Convert a JSON array of objects to CSV", badge: "CSV", cat: "data", page: "/tools/json-to-csv" },
  { id: "nanoid-gen", name: "Nanoid Generator", desc: "Generate compact, URL-safe unique IDs", badge: "nid", cat: "gen", page: "/tools/nanoid-generator" },
  { id: "prime-tools", name: "Prime Number Checker", desc: "Check primality & list primes in a range", badge: "P?", cat: "gen", page: "/tools/prime-number-checker" },
  { id: "stats-calc", name: "Statistics Calculator", desc: "Mean, median, mode & standard deviation", badge: "σ", cat: "gen", page: "/tools/statistics-calculator" },
  { id: "ascii-convert", name: "ASCII ⇄ Text Converter", desc: "Convert between text and ASCII codes", badge: "AS", cat: "encode", page: "/tools/ascii-converter" },
  { id: "random-color", name: "Random Color Generator", desc: "Generate random HEX, RGB or HSL colors", badge: "🎨", cat: "image", page: "/tools/random-color-generator" },
  { id: "punycode", name: "Punycode (IDN) Converter", desc: "Encode & decode internationalized domains", badge: "IDN", cat: "encode", page: "/tools/punycode-converter" },
  { id: "base58", name: "Base58 Encode/Decode", desc: "Encode & decode using the Bitcoin Base58 alphabet", badge: "58", cat: "encode", page: "/tools/base58-encoder" },
  { id: "robots-validate", name: "robots.txt Validator", desc: "Check robots.txt syntax for common mistakes", badge: "/rb", cat: "web", page: "/tools/robots-txt-validator" },
  { id: "crc32", name: "CRC32 Checksum", desc: "Compute a CRC32 checksum of text", badge: "CRC", cat: "sec", page: "/tools/crc32-checksum" },
  { id: "git-branch-gen", name: "Git Branch Name Generator", desc: "Turn a ticket title into a clean branch name", badge: "⎇", cat: "gen", page: "/tools/git-branch-name-generator" },
  { id: "svg-datauri", name: "SVG to CSS Data URI", desc: "Convert SVG markup into a CSS-ready data URI", badge: "svg", cat: "web", page: "/tools/svg-to-data-uri" },
  // --- batch 4 tools ---
  { id: "toml-json", name: "TOML ⇄ JSON Converter", desc: "Convert TOML config to JSON and back", badge: "T⇄J", cat: "data", page: "/tools/toml-json-converter" },
  { id: "ini-json", name: "INI ⇄ JSON Converter", desc: "Convert INI config to JSON and back", badge: "I⇄J", cat: "data", page: "/tools/ini-json-converter" },
  { id: "password-strength", name: "Password Strength Checker", desc: "Score a password & get suggestions to improve it", badge: "pw", cat: "sec", page: "/tools/password-strength-checker" },
  { id: "regex-to-code", name: "Regex to Code Snippet", desc: "Turn a regex pattern into ready-to-use code", badge: "re", cat: "web", page: "/tools/regex-to-code-snippet" },
  { id: "commit-msg-gen", name: "Commit Message Formatter", desc: "Format a Conventional Commits message", badge: "git", cat: "gen", page: "/tools/commit-message-formatter" },
  { id: "package-json-validate", name: "package.json Validator", desc: "Validate & format a package.json file", badge: "pkg", cat: "data", page: "/tools/package-json-validator" },
  { id: "dockerfile-lint", name: "Dockerfile Linter", desc: "Catch common Dockerfile mistakes", badge: "🐳", cat: "web", page: "/tools/dockerfile-linter" },
  { id: "semver-tools", name: "Semver Parser / Comparator", desc: "Break down or compare semantic versions", badge: "semv", cat: "gen", page: "/tools/semver-parser-comparator" },
  { id: "css-specificity", name: "CSS Specificity Calculator", desc: "Score the specificity of CSS selectors", badge: "css", cat: "web", page: "/tools/css-specificity-calculator" },
  { id: "ip-subnet-calc", name: "IP Subnet / CIDR Calculator", desc: "Network, broadcast & usable host range from a CIDR", badge: "IP", cat: "web", page: "/tools/ip-subnet-calculator" },
  { id: "mime-lookup", name: "MIME Type ⇄ Extension Lookup", desc: "Look up MIME types and file extensions", badge: "mime", cat: "web", page: "/tools/mime-type-lookup" },
  { id: "http-status-lookup", name: "HTTP Status Code Lookup", desc: "Look up the meaning of an HTTP status code", badge: "4xx", cat: "web", page: "/tools/http-status-lookup" },
  { id: "number-to-words", name: "Number ⇄ Words Converter", desc: "Spell out numbers in words, or parse them back", badge: "123", cat: "gen", page: "/tools/number-to-words-converter" },
  { id: "base36", name: "Base36 Encode/Decode", desc: "Encode & decode using Base36 (0-9, a-z)", badge: "36", cat: "encode", page: "/tools/base36-encode-decode" },
  { id: "mocking-case", name: "Mocking Case Converter", desc: "aLtErNaTiNg CaSe, meme-style", badge: "Aa", cat: "data", page: "/tools/mocking-case-converter" },
  // --- batch 5 tools ---
  { id: "tailwind-sort", name: "Tailwind CSS Class Sorter", desc: "Sort Tailwind classes into recommended order", badge: "tw", cat: "web", page: "/tools/tailwind-class-sorter" },
  { id: "regex-explain", name: "Regex Explainer", desc: "Turn a regex pattern into a plain-English breakdown", badge: "re", cat: "web", page: "/tools/regex-explainer" },
  { id: "json-to-zod", name: "JSON to Zod Schema", desc: "Generate a Zod schema from a JSON sample", badge: "zod", cat: "data", page: "/tools/json-to-zod-schema" },
  { id: "json-to-graphql", name: "JSON to GraphQL SDL", desc: "Generate GraphQL type definitions from JSON", badge: "gql", cat: "data", page: "/tools/json-to-graphql-schema" },
  { id: "json-to-openapi", name: "JSON to OpenAPI Schema", desc: "Generate an OpenAPI schema fragment from JSON", badge: "oapi", cat: "data", page: "/tools/json-to-openapi-schema" },
  { id: "graphql-tools", name: "GraphQL Formatter / Minifier", desc: "Pretty-print or collapse a GraphQL query", badge: "gql", cat: "data", page: "/tools/graphql-formatter" },
  { id: "passphrase-gen", name: "Passphrase Generator", desc: "Diceware-style memorable multi-word passphrases", badge: "pass", cat: "gen", page: "/tools/passphrase-generator" },
  { id: "ulid-gen", name: "ULID Generator", desc: "Generate sortable, timestamp-based unique IDs", badge: "ulid", cat: "gen", page: "/tools/ulid-generator" },
  { id: "color-palette-gen", name: "Color Palette Generator", desc: "Generate a palette from a base color", badge: "🎨", cat: "image", page: "/tools/color-palette-generator" },
  { id: "fluid-type-calc", name: "CSS Fluid Type Calculator", desc: "Generate a responsive clamp() font-size rule", badge: "clmp", cat: "web", page: "/tools/css-fluid-type-calculator" },
  { id: "emoji-convert", name: "Emoji Shortcode Converter", desc: "Convert between :shortcode: patterns and emoji", badge: "😄", cat: "data", page: "/tools/emoji-shortcode-converter" },
  { id: "htaccess-to-nginx", name: ".htaccess → Nginx Converter", desc: "Convert common Apache directives to Nginx config", badge: "ngx", cat: "web", page: "/tools/htaccess-to-nginx-converter" },
  { id: "docker-compose-validate", name: "Docker Compose Validator", desc: "Check docker-compose.yml for common mistakes", badge: "🐳", cat: "web", page: "/tools/docker-compose-validator" },
  { id: "jwk-to-pem", name: "JWK to PEM Converter", desc: "Convert a JSON Web Key into PEM format", badge: "pem", cat: "sec", page: "/tools/jwk-to-pem-converter" },
  { id: "env-diff", name: ".env Diff Checker", desc: "Compare two .env files for missing or differing keys", badge: ".env", cat: "data", page: "/tools/env-diff-checker" },
  { id: "md-to-chat", name: "Markdown → Slack/Discord Converter", desc: "Convert Markdown into Slack or Discord formatting", badge: "#", cat: "data", page: "/tools/markdown-to-slack-discord" },
  { id: "csv-to-md-table", name: "CSV to Markdown Table", desc: "Convert CSV rows into a Markdown table", badge: "|--|", cat: "data", page: "/tools/csv-to-markdown-table" },
  { id: "rate-limit-calc", name: "API Rate Limit Calculator", desc: "Work out remaining requests & a safe request pace", badge: "rl", cat: "gen", page: "/tools/api-rate-limit-calculator" },
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
