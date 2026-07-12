"use client";

import { useIsMobile } from "@/hooks/use-media-query";
import DesktopDashboardView from "@/components/workspace/dashboard/DesktopDashboardView";
import MobileDashboardView from "@/components/workspace/dashboard/MobileDashboardView";

/**
 * Mobile gets its own dashboard layout entirely (single scrolling column,
 * stacked workflow cards instead of a table, no fixed-width aside) rather
 * than conditional classes sprinkled through one big component — same
 * approach as CanvasArea/MobileCanvasArea. Both views read the same
 * useDashboardData() hook, so this file is the only thing that changed.
 */
export default function DashboardPage() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileDashboardView /> : <DesktopDashboardView />;
}
