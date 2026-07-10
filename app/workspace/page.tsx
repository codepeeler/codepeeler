"use client";

import { Menu } from "lucide-react";
import { WorkflowProvider } from "@/providers/workflow-provider";
import TabsBar from "@/components/workspace/TabsBar";
import CanvasToolbar from "@/components/workspace/CanvasToolbar";
import NavRail, { NAV_RAIL_PANEL_ID } from "@/components/workspace/NavRail";
import ToolPalette from "@/components/workspace/ToolPalette";
import CanvasArea from "@/components/workspace/canvas/CanvasArea";
import Inspector from "@/components/workspace/Inspector";
import BottomPanel from "@/components/workspace/BottomPanel";
import MobileFabs from "@/components/workspace/MobileFabs";
import MobileHeader from "@/components/layout/mobile/MobileHeader";
import { useMobileShell } from "@/providers/mobile-shell-provider";

function WorkspaceMobileHeader() {
  const { togglePanel } = useMobileShell();
  return (
    <MobileHeader
      title="Workspace"
      actions={[{ key: "menu", icon: Menu, label: "Menu", onClick: () => togglePanel(NAV_RAIL_PANEL_ID) }]}
    />
  );
}

export default function WorkspacePage() {
  return (
    <WorkflowProvider>
      <WorkspaceMobileHeader />
      <TabsBar />
      <CanvasToolbar />

      <div className="relative flex min-h-0 flex-1">
        <NavRail />
        <ToolPalette />
        <CanvasArea />
        <Inspector />
      </div>

      <BottomPanel />
      <MobileFabs />
    </WorkflowProvider>
  );
}
