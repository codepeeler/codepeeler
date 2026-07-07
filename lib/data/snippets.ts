import {
  Braces,
  ShieldCheck,
  Database,
  Terminal,
  Globe2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

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

export const SNIPPETS: Snippet[] = [
  {
    id: "jwt-auth-middleware",
    title: "JWT Authentication Middleware",
    desc: "Secure JWT auth middleware for Express.js applications.",
    language: "JavaScript",
    category: "Authentication",
    author: "dev_master",
    views: 2400,
    uses: 512,
    rating: 4.9,
    tags: ["JavaScript", "Node.js", "API"],
    bookmarked: true,
    mine: true,
    createdAgo: "3 months ago",
    updatedAgo: "2 weeks ago",
    code: `const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({
    message: 'Unauthorized'
  });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};`,
  },
  {
    id: "python-retry-decorator",
    title: "Python: Retry Decorator",
    desc: "Retry decorator with exponential backoff.",
    language: "Python",
    category: "Utilities",
    author: "code_automate",
    views: 1800,
    uses: 342,
    rating: 4.8,
    tags: ["Python", "Utilities"],
    bookmarked: false,
    mine: false,
    createdAgo: "5 months ago",
    updatedAgo: "1 month ago",
    code: `import time
from functools import wraps

def retry(times=3, delay=1, backoff=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception:
                    if attempt == times - 1:
                        raise
                    time.sleep(delay * (backoff ** attempt))
        return wrapper
    return decorator`,
  },
  {
    id: "sql-top-n-records",
    title: "SQL: Get Top N Records",
    desc: "Get top N records from a table with conditions.",
    language: "SQL",
    category: "Database",
    author: "data_wizard",
    views: 1600,
    uses: 278,
    rating: 4.7,
    tags: ["SQL", "Database"],
    bookmarked: false,
    mine: false,
    createdAgo: "6 months ago",
    updatedAgo: "3 months ago",
    code: `SELECT *
FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;`,
  },
  {
    id: "react-useclickoutside",
    title: "React: UseClickOutside Hook",
    desc: "Detect clicks outside of a component.",
    language: "TypeScript",
    category: "React Hooks",
    author: "react_hacker",
    views: 1300,
    uses: 235,
    rating: 4.6,
    tags: ["React", "TypeScript"],
    bookmarked: true,
    mine: false,
    createdAgo: "2 months ago",
    updatedAgo: "1 week ago",
    code: `import { useEffect } from 'react';

export function useClickOutside(ref, handler) {
  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, handler]);
}`,
  },
  {
    id: "bash-backup-script",
    title: "Bash: Backup Script",
    desc: "Simple bash script to backup a directory.",
    language: "Bash",
    category: "DevOps",
    author: "web_hacker",
    views: 1100,
    uses: 189,
    rating: 4.8,
    tags: ["Bash", "DevOps"],
    bookmarked: false,
    mine: true,
    createdAgo: "4 months ago",
    updatedAgo: "4 months ago",
    code: `#!/bin/bash

SOURCE_DIR="/var/www/html"
BACKUP_DIR="/backups/html_$(date +%Y%m%d_%H%M%S).tar.gz"

tar -czf "$BACKUP_DIR" "$SOURCE_DIR"
echo "Backup saved to $BACKUP_DIR"`,
  },
  {
    id: "mongodb-pagination",
    title: "MongoDB: Pagination",
    desc: "Pagination logic for MongoDB queries.",
    language: "JavaScript",
    category: "Database",
    author: "mongo_expert",
    views: 1000,
    uses: 162,
    rating: 4.7,
    tags: ["MongoDB", "API"],
    bookmarked: false,
    mine: false,
    createdAgo: "7 months ago",
    updatedAgo: "5 months ago",
    code: `const getPaginatedData = async (model, page, limit) => {
  const skip = (page - 1) * limit;
  const data = await model.find().skip(skip).limit(limit);
  const total = await model.countDocuments();
  return { data, total, page, totalPages: Math.ceil(total / limit) };
};`,
  },
  {
    id: "rate-limiter-middleware",
    title: "Rate Limiter Middleware",
    desc: "Simple in-memory sliding-window rate limiter for Express.",
    language: "JavaScript",
    category: "API",
    author: "dev_master",
    views: 2600,
    uses: 431,
    rating: 4.8,
    tags: ["JavaScript", "API", "Node.js"],
    bookmarked: false,
    mine: false,
    createdAgo: "2 months ago",
    updatedAgo: "3 weeks ago",
    code: `const hits = new Map();

module.exports = function rateLimiter({ windowMs = 60000, max = 60 } = {}) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const entry = hits.get(key) ?? { count: 0, start: now };
    if (now - entry.start > windowMs) {
      entry.count = 0;
      entry.start = now;
    }
    entry.count += 1;
    hits.set(key, entry);
    if (entry.count > max) {
      return res.status(429).json({ message: 'Too many requests' });
    }
    next();
  };
};`,
  },
  {
    id: "image-upload-multer",
    title: "Image Upload with Multer",
    desc: "Image upload endpoint with type & size validation.",
    language: "JavaScript",
    category: "API",
    author: "web_hacker",
    views: 2100,
    uses: 298,
    rating: 4.6,
    tags: ["Node.js", "API"],
    bookmarked: false,
    mine: false,
    createdAgo: "3 months ago",
    updatedAgo: "1 month ago",
    code: `const multer = require('multer');

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
  },
});

app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ file: req.file.filename });
});`,
  },
  {
    id: "validate-email-regex",
    title: "Validate Email (Regex)",
    desc: "Pragmatic email validation regex with helper function.",
    language: "TypeScript",
    category: "Validation",
    author: "code_automate",
    views: 1900,
    uses: 356,
    rating: 4.7,
    tags: ["TypeScript", "Validation"],
    bookmarked: true,
    mine: false,
    createdAgo: "5 months ago",
    updatedAgo: "2 months ago",
    code: `const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}`,
  },
  {
    id: "cors-configuration",
    title: "CORS Configuration",
    desc: "Minimal CORS setup with an origin allow-list.",
    language: "JavaScript",
    category: "API",
    author: "api_expert",
    views: 1800,
    uses: 318,
    rating: 4.7,
    tags: ["API", "Node.js"],
    bookmarked: false,
    mine: false,
    createdAgo: "6 months ago",
    updatedAgo: "4 months ago",
    code: `const cors = require('cors');

const allowlist = ['https://app.example.com', 'http://localhost:3000'];

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowlist.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));`,
  },
  {
    id: "env-config-loader",
    title: "Environment Config",
    desc: "Typed environment variable loader with validation.",
    language: "TypeScript",
    category: "DevOps",
    author: "sys_admin",
    views: 1600,
    uses: 289,
    rating: 4.6,
    tags: ["TypeScript", "DevOps"],
    bookmarked: false,
    mine: false,
    createdAgo: "4 months ago",
    updatedAgo: "2 months ago",
    code: `function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(\`Missing env var: \${name}\`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
};`,
  },
  {
    id: "debounce-function",
    title: "Debounce Utility",
    desc: "Generic debounce helper for search inputs and resize handlers.",
    language: "TypeScript",
    category: "Utilities",
    author: "react_hacker",
    views: 2200,
    uses: 401,
    rating: 4.9,
    tags: ["TypeScript", "Utilities"],
    bookmarked: true,
    mine: true,
    createdAgo: "1 month ago",
    updatedAgo: "3 days ago",
    code: `export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300
) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}`,
  },
];

export const POPULAR_TAGS: { label: string; count: string }[] = [
  { label: "JavaScript", count: "2.1K" },
  { label: "Python", count: "1.6K" },
  { label: "React", count: "1.2K" },
  { label: "Node.js", count: "1.1K" },
  { label: "TypeScript", count: "947" },
  { label: "SQL", count: "802" },
  { label: "MongoDB", count: "576" },
  { label: "Docker", count: "498" },
  { label: "Bash", count: "412" },
  { label: "API", count: "398" },
  { label: "Next.js", count: "354" },
];

export const TRENDING_SNIPPETS: { id: string; title: string; author: string; uses: string }[] = [
  { id: "rate-limiter-middleware", title: "Rate Limiter Middleware", author: "dev_master", uses: "2.6K" },
  { id: "image-upload-multer", title: "Image Upload with Multer", author: "web_hacker", uses: "2.1K" },
  { id: "validate-email-regex", title: "Validate Email (Regex)", author: "code_automate", uses: "1.9K" },
  { id: "cors-configuration", title: "CORS Configuration", author: "api_expert", uses: "1.8K" },
  { id: "env-config-loader", title: "Environment Config", author: "sys_admin", uses: "1.6K" },
];

export const SNIPPET_STATS = {
  totalSnippets: "12.4K+",
  totalSnippetsGrowth: "+ 18% this month",
  totalUses: "28.6K+",
  totalUsesGrowth: "+ 22% this month",
  contributors: "3.2K+",
  contributorsGrowth: "+ 15% this month",
  avgRating: "4.8/5",
  avgRatingSub: "from 1,236 reviews",
};

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
