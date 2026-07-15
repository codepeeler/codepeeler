import { Braces, ShieldCheck, Database, Terminal, Globe2, Sparkles, type LucideIcon } from "lucide-react";

export type SnippetLanguage =
  | "JavaScript"
  | "TypeScript"
  | "Python"
  | "SQL"
  | "Bash"
  | "JSON"
  | "HTML"
  | "CSS"
  | "Go"
  | "Rust";

export type Snippet = {
  id: string;
  title: string;
  desc: string;
  language: SnippetLanguage;
  category: string;
  code: string;
  author: string;
  views: number;
  uses: number;
  rating: number;
  tags: string[];
  bookmarked: boolean;
  mine: boolean;
  createdAgo: string;
  updatedAgo: string;
};

export const LANGUAGES: SnippetLanguage[] = [
  "JavaScript",
  "TypeScript",
  "Python",
  "SQL",
  "Bash",
  "JSON",
  "HTML",
  "CSS",
  "Go",
  "Rust",
];

export const CATEGORIES = [
  "Authentication",
  "Data Processing",
  "Database",
  "React Hooks",
  "DevOps",
  "API",
  "Utilities",
  "Validation",
] as const;

export const LANGUAGE_COLOR: Record<SnippetLanguage, string> = {
  JavaScript: "var(--cat-gen)",
  TypeScript: "var(--cat-encode)",
  Python: "var(--cat-data)",
  SQL: "var(--cat-sec)",
  Bash: "var(--text-dim)",
  JSON: "var(--cat-data)",
  HTML: "var(--cat-image)",
  CSS: "var(--cat-web)",
  Go: "var(--cat-web)",
  Rust: "#DC5B3E",
};

export const FILTER_TABS = [
  { key: "featured", label: "Featured" },
  { key: "popular", label: "Popular" },
  { key: "latest", label: "Latest" },
  { key: "most-used", label: "Most Used" },
] as const;

export type SnippetFilterKey = (typeof FILTER_TABS)[number]["key"];

// Real snippet data, community stats, popular tags, and trending snippets
// all come from GET /api/snippets now (see hooks/use-snippets-data.ts) —
// this file only holds the static UI vocabulary (languages, categories,
// tab labels, icon mapping) that doesn't depend on the database.

export const SNIPPET_STAT_ICONS: { key: "totalSnippets" | "totalUses" | "contributors" | "avgRating"; icon: LucideIcon; color: string }[] = [
  { key: "totalSnippets", icon: Braces, color: "var(--cat-data)" },
  { key: "totalUses", icon: Terminal, color: "var(--cat-encode)" },
  { key: "contributors", icon: Sparkles, color: "var(--cat-gen)" },
  { key: "avgRating", icon: ShieldCheck, color: "var(--warning)" },
];

export const MY_SNIPPETS_NAV = [
  { key: "mine", label: "My Snippets", icon: Braces },
  { key: "bookmarked", label: "Bookmarked", icon: Database },
  { key: "recent", label: "Recently Used", icon: Globe2 },
  { key: "drafts", label: "Drafts", icon: Terminal },
] as const;
