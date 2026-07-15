import { NextRequest, NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { snippet, snippetBookmark, user } from "@/lib/db/schema";
import { formatTimeAgo } from "@/lib/utils";
import { recordActivity } from "@/lib/activity";

const VALID_LANGUAGES = ["JavaScript", "TypeScript", "Python", "SQL", "Bash", "JSON", "HTML", "CSS", "Go", "Rust"];

/**
 * Community snippets are visible to every signed-in user (no owner
 * filtering on GET, unlike /api/collections). `mine` and `bookmarked` are
 * derived per-request from the caller's session + their bookmark rows —
 * never stored on the snippet row itself, since it's shared across every
 * viewer. Stats/popularTags/trendingSnippets are computed here too so the
 * page needs exactly one request.
 */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const rows = await db
    .select({
      id: snippet.id,
      userId: snippet.userId,
      title: snippet.title,
      desc: snippet.desc,
      language: snippet.language,
      category: snippet.category,
      code: snippet.code,
      tags: snippet.tags,
      views: snippet.views,
      uses: snippet.uses,
      rating: snippet.rating,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
      authorName: user.name,
    })
    .from(snippet)
    .leftJoin(user, eq(snippet.userId, user.id));

  const myBookmarks = await db
    .select({ snippetId: snippetBookmark.snippetId })
    .from(snippetBookmark)
    .where(eq(snippetBookmark.userId, session.user.id));
  const bookmarkedSet = new Set(myBookmarks.map((b) => b.snippetId));

  const list = rows.map((r) => ({
    id: r.id,
    title: r.title,
    desc: r.desc,
    language: r.language,
    category: r.category,
    code: r.code,
    author: r.authorName ?? "unknown",
    views: r.views,
    uses: r.uses,
    rating: r.rating,
    tags: r.tags as string[],
    bookmarked: bookmarkedSet.has(r.id),
    mine: r.userId === session.user.id,
    createdAgo: formatTimeAgo(r.createdAt),
    updatedAgo: formatTimeAgo(r.updatedAt),
    createdAt: r.createdAt,
  }));

  // Community stats — computed from the full table, same numbers every
  // viewer sees (unlike mine/bookmarked above).
  const totalUses = rows.reduce((sum, r) => sum + r.uses, 0);
  const contributors = new Set(rows.map((r) => r.userId)).size;
  const ratedRows = rows.filter((r) => r.rating > 0);
  const avgRating = ratedRows.length ? ratedRows.reduce((s, r) => s + r.rating, 0) / ratedRows.length : 0;

  const tagCounts = new Map<string, number>();
  for (const r of rows) {
    for (const t of (r.tags as string[]) ?? []) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }
  const popularTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 11)
    .map(([label, count]) => ({ label, count: count >= 1000 ? `${(count / 1000).toFixed(1)}K` : `${count}` }));

  const trendingSnippets = [...list]
    .sort((a, b) => b.uses - a.uses)
    .slice(0, 5)
    .map((s) => ({ id: s.id, title: s.title, author: s.author, uses: s.uses >= 1000 ? `${(s.uses / 1000).toFixed(1)}K` : `${s.uses}` }));

  return NextResponse.json({
    snippets: list,
    stats: {
      totalSnippets: `${rows.length}`,
      totalUses: totalUses >= 1000 ? `${(totalUses / 1000).toFixed(1)}K+` : `${totalUses}`,
      contributors: `${contributors}`,
      avgRating: ratedRows.length ? `${avgRating.toFixed(1)}/5` : "—",
      avgRatingSub: `from ${ratedRows.length} review${ratedRows.length === 1 ? "" : "s"}`,
    },
    popularTags,
    trendingSnippets,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    desc?: string;
    language?: string;
    category?: string;
    code?: string;
    tags?: string[];
  };

  if (!body.title?.trim()) return NextResponse.json({ error: "Missing title" }, { status: 400 });
  const language = VALID_LANGUAGES.includes(body.language ?? "") ? (body.language as string) : "JavaScript";

  const [row] = await db
    .insert(snippet)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      title: body.title.trim(),
      desc: body.desc?.trim() ?? "",
      language,
      category: body.category?.trim() || "Utilities",
      code: body.code ?? "// Start typing your snippet here",
      tags: body.tags ?? [],
    })
    .returning();

  await recordActivity(session.user.id, "snippet_create", row.id, row.title);

  return NextResponse.json(
    {
      snippet: {
        ...row,
        author: session.user.name,
        bookmarked: false,
        mine: true,
        createdAgo: "just now",
        updatedAgo: "just now",
      },
    },
    { status: 201 }
  );
}
