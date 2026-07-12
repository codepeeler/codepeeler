"use client";

import { WorkflowProvider } from "@/providers/workflow-provider";
import { useIsMobile } from "@/hooks/use-media-query";
import DesktopSnippetsView from "@/components/snippets/DesktopSnippetsView";
import MobileSnippetsView from "@/components/snippets/MobileSnippetsView";

/**
 * Mobile gets its own snippets layout entirely (search + scrollable filter
 * row, no fixed-width sidebar) rather than conditional classes sprinkled
 * through one big component — same approach as CanvasArea/MobileCanvasArea.
 * Both views read the same useSnippetsData() hook, so this file is the only
 * thing that changed.
 */
export default function SnippetsPage() {
  const isMobile = useIsMobile();
  return (
    <WorkflowProvider>{isMobile ? <MobileSnippetsView /> : <DesktopSnippetsView />}</WorkflowProvider>
  );
}
