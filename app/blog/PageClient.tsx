"use client";

import { useIsMobile } from "@/hooks/use-media-query";
import DesktopBlogView from "@/components/blog/DesktopBlogView";
import MobileBlogView from "@/components/blog/MobileBlogView";

/**
 * Mobile gets its own blog layout entirely (stacked sections, scrollable
 * category chips) rather than conditional classes sprinkled through one big
 * component — same approach as CanvasArea/MobileCanvasArea and the
 * dashboard/snippets pages. Both views read the same useBlogData() hook.
 */
export default function BlogPage() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileBlogView /> : <DesktopBlogView />;
}
