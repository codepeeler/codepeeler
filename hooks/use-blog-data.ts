"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, POSTS, FEATURED_POST, FEATURED_SIDEBAR, SORT_TABS, type BlogSortTab } from "@/lib/data/blog";
import { useToast } from "@/providers/toast-provider";

const VISIBLE_STEP = 4;

/**
 * All Blog page state and handlers live here. DesktopBlogView and
 * MobileBlogView each call this directly (same pattern as
 * useDashboardData()/useSnippetsData()), so sort order, active category,
 * and newsletter behavior are always identical between the two layouts —
 * only the arrangement differs.
 */
export function useBlogData() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [sortTab, setSortTab] = useState<BlogSortTab>("Latest");
  const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);
  const [email, setEmail] = useState("");

  const filtered = useMemo(() => {
    let result =
      activeCategory === "All Posts" ? POSTS : POSTS.filter((p) => p.category === activeCategory);

    if (sortTab === "Popular") {
      result = [...result].sort((a, b) => b.views - a.views);
    } else if (sortTab === "Most Discussed") {
      result = [...result].sort((a, b) => b.comments - a.comments);
    }
    return result;
  }, [activeCategory, sortTab]);

  const visiblePosts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = () => setVisibleCount((v) => v + VISIBLE_STEP);

  const subscribe = () => {
    if (!email.trim()) {
      toast("Enter an email address first");
      return;
    }
    toast("Subscribed — check your inbox to confirm");
    setEmail("");
  };

  return {
    featuredPost: FEATURED_POST,
    featuredSidebar: FEATURED_SIDEBAR,
    categories: CATEGORIES,
    activeCategory,
    setActiveCategory,
    sortTab,
    setSortTab,
    sortTabs: SORT_TABS,
    visiblePosts,
    hasMore,
    loadMore,
    email,
    setEmail,
    subscribe,
  };
}
