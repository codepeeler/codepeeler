import { Code2, ShieldCheck, Rocket, Terminal, type LucideIcon } from "lucide-react";

export type BlogCategory = "Engineering" | "Tutorials" | "Productivity" | "Security" | "Product Updates" | "Community";

export const CATEGORY_COLOR: Record<BlogCategory, string> = {
  Engineering: "var(--primary)",
  Tutorials: "var(--warning)",
  Productivity: "var(--secondary)",
  Security: "var(--success)",
  "Product Updates": "var(--primary)",
  Community: "var(--secondary)",
};

export type BlogPost = {
  id: string;
  title: string;
  desc: string;
  category: BlogCategory;
  author: string;
  date: string;
  readTime: string;
  views: number;
  comments: number;
  featured?: boolean;
};

export const CATEGORIES: { name: string; count: number }[] = [
  { name: "All Posts", count: 18 },
  { name: "Engineering", count: 5 },
  { name: "Tutorials", count: 4 },
  { name: "Productivity", count: 3 },
  { name: "Security", count: 3 },
  { name: "Product Updates", count: 2 },
  { name: "Community", count: 1 },
];

export const FEATURED_POST: BlogPost = {
  id: "workflow-automation-tips",
  title: "10 Workflow Automation Tips to Save Hours Every Week",
  desc: "Learn practical automation strategies that developers use to eliminate repetitive tasks and ship faster.",
  category: "Productivity",
  author: "Rohit Sharma",
  date: "May 12, 2024",
  readTime: "8 min read",
  views: 0,
  comments: 0,
  featured: true,
};

export const POSTS: BlogPost[] = [
  {
    id: "scalable-apis-2024",
    title: "Building Scalable APIs: Best Practices in 2024",
    desc: "Explore architectural patterns, versioning strategies, and performance techniques for building APIs that scale.",
    category: "Engineering",
    author: "Ankita Patil",
    date: "May 9, 2024",
    readTime: "6 min read",
    views: 1200,
    comments: 24,
  },
  {
    id: "securing-workflows",
    title: "Securing Your Workflows: A Developer's Guide",
    desc: "Security best practices for managing secrets, access control, and data protection in automated workflows.",
    category: "Security",
    author: "Vikram Singh",
    date: "May 6, 2024",
    readTime: "7 min read",
    views: 987,
    comments: 18,
  },
  {
    id: "manual-to-automated",
    title: "From Manual to Automated: My Dev Productivity Journey",
    desc: "How I automated 80% of my daily tasks and what tools helped me the most.",
    category: "Productivity",
    author: "Priya Nair",
    date: "May 2, 2024",
    readTime: "5 min read",
    views: 876,
    comments: 16,
  },
  {
    id: "first-workflow-10-min",
    title: "Create Your First Workflow in 10 Minutes",
    desc: "Step-by-step guide to building your first workflow using CodePeeler's visual builder.",
    category: "Tutorials",
    author: "Arjun Dev",
    date: "Apr 29, 2024",
    readTime: "4 min read",
    views: 745,
    comments: 12,
  },
  {
    id: "api-versioning-strategies",
    title: "API Versioning Strategies That Actually Work",
    desc: "A practical comparison of URI, header, and content-negotiation versioning for long-lived APIs.",
    category: "Engineering",
    author: "Ankita Patil",
    date: "Apr 24, 2024",
    readTime: "6 min read",
    views: 612,
    comments: 9,
  },
  {
    id: "webhook-inbox-guide",
    title: "Debugging Webhooks Faster with a Local Inbox",
    desc: "Why capturing every webhook request locally beats digging through provider dashboards.",
    category: "Tutorials",
    author: "Arjun Dev",
    date: "Apr 20, 2024",
    readTime: "5 min read",
    views: 540,
    comments: 7,
  },
];

export const FEATURED_SIDEBAR: { id: string; title: string; date: string; icon: LucideIcon; color: string }[] = [
  { id: "v2-launch", title: "What's New in CodePeeler v2.0", date: "Apr 20, 2024", icon: Rocket, color: "var(--primary)" },
  { id: "custom-integrations", title: "Build Custom Integrations with Ease", date: "Apr 15, 2024", icon: Code2, color: "var(--success)" },
  { id: "rate-limits", title: "Understanding Rate Limits in APIs", date: "Apr 10, 2024", icon: Terminal, color: "var(--secondary)" },
];

export const SORT_TABS = ["Latest", "Popular", "Most Discussed"] as const;
export type BlogSortTab = (typeof SORT_TABS)[number];

// Icon set used by the featured post's decorative workflow mockup.
export const MOCKUP_ICONS: LucideIcon[] = [Code2, ShieldCheck, Terminal];
