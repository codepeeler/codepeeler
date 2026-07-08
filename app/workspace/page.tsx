import { WorkflowProvider } from "@/providers/workflow-provider";
import TabsBar from "@/components/workspace/TabsBar";
import CanvasToolbar from "@/components/workspace/CanvasToolbar";
import NavRail from "@/components/workspace/NavRail";
import ToolPalette from "@/components/workspace/ToolPalette";
import CanvasArea from "@/components/workspace/canvas/CanvasArea";
import Inspector from "@/components/workspace/Inspector";
import BottomPanel from "@/components/workspace/BottomPanel";
import MobileFabs from "@/components/workspace/MobileFabs";

export default function WorkspacePage() {
  return (
    <WorkflowProvider>
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
