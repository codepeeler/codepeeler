"use client";

import { useEffect, useState } from "react";
import { Layers, Settings2 } from "lucide-react";
import { ApiTesterProvider, useApiTester } from "@/providers/api-tester-provider";
import { PageHeader, RequestTabsBar, UrlBar } from "@/components/api-tester/ApiTesterTopbar";
import { WorkflowProvider } from "@/providers/workflow-provider";
import ApiSidebar, { API_SIDEBAR_PANEL_ID } from "@/components/api-tester/ApiSidebar";
import EnvironmentPanel, { ENVIRONMENT_PANEL_ID } from "@/components/api-tester/EnvironmentPanel";
import RequestPanel from "@/components/api-tester/RequestPanel";
import ResponsePanel from "@/components/api-tester/ResponsePanel";
import StreamPanel from "@/components/api-tester/StreamPanel";
import { CodeSnippetModal, EnvironmentManagerModal, ImportModal, SaveRequestModal } from "@/components/api-tester/Modals";
import { LoadTestModal } from "@/components/api-tester/LoadTestModal";
import { AiAssistantModal } from "@/components/api-tester/AiAssistantPanel";
import MobileHeader from "@/components/layout/mobile/MobileHeader";
import { useMobileShell } from "@/providers/mobile-shell-provider";

type ModalKey = "code" | "save" | "env" | "import" | "loadtest" | "ai" | null;

function ApiTesterShell() {
  const { activeTab, vars, send, connectWebSocket, disconnectWebSocket, connectSSE, disconnectSSE } = useApiTester();
  const { togglePanel } = useMobileShell();
  const [modal, setModal] = useState<ModalKey>(null);

  // keyboard shortcuts: Cmd/Ctrl+Enter send (or connect/disconnect for WS/SSE tabs), Cmd/Ctrl+S save, Cmd/Ctrl+T new tab
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "Enter") {
        e.preventDefault();
        if (!activeTab || activeTab.request.protocol === "http") { send(); return; }
        const isWs = activeTab.request.protocol === "websocket";
        const isOpen = activeTab.streamStatus === "open" || activeTab.streamStatus === "connecting";
        if (isOpen) (isWs ? disconnectWebSocket : disconnectSSE)();
        else (isWs ? connectWebSocket : connectSSE)();
      }
      else if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); if (activeTab) setModal("save"); }
      else if (mod && e.key.toLowerCase() === "i") { e.preventDefault(); if (activeTab) setModal("ai"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [send, activeTab, connectWebSocket, disconnectWebSocket, connectSSE, disconnectSSE]);

  if (!activeTab) return null;

  return (
    <>
      <MobileHeader
        title={activeTab.name}
        actions={[
          { key: "collections", icon: Layers, label: "Collections & History", onClick: () => togglePanel(API_SIDEBAR_PANEL_ID) },
          { key: "env", icon: Settings2, label: "Environment", onClick: () => togglePanel(ENVIRONMENT_PANEL_ID) },
        ]}
      />
      <div className="flex min-h-0 flex-1">
        <ApiSidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="hidden lg:block">
            <PageHeader onImport={() => setModal("import")} />
            <RequestTabsBar />
          </div>
          <div className="mx-4 mt-2.5 overflow-hidden rounded-[14px] border border-[var(--border-soft)] bg-[var(--card)]">
            <UrlBar onOpenCode={() => setModal("code")} onOpenSave={() => setModal("save")} onOpenLoadTest={() => setModal("loadtest")} onOpenAi={() => setModal("ai")} />
          </div>
          <div className="m-4 mt-2.5 flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex min-h-[220px] flex-[0_1_46%] flex-col overflow-hidden rounded-[14px] border border-[var(--border-soft)] bg-[var(--card)]">
              <RequestPanel />
            </div>
            <div className="flex min-h-[220px] flex-[1_1_54%] flex-col overflow-hidden rounded-[14px] border border-[var(--border-soft)] bg-[var(--card)]">
              {activeTab.request.protocol === "http" ? <ResponsePanel /> : <StreamPanel />}
            </div>
          </div>
        </main>
        <EnvironmentPanel onOpenManager={() => setModal("env")} />
      </div>

      {modal === "code" && <CodeSnippetModal request={activeTab.request} vars={vars} onClose={() => setModal(null)} />}
      {modal === "save" && <SaveRequestModal onClose={() => setModal(null)} />}
      {modal === "env" && <EnvironmentManagerModal onClose={() => setModal(null)} />}
      {modal === "import" && <ImportModal onClose={() => setModal(null)} />}
      {modal === "loadtest" && <LoadTestModal targetType="request" onClose={() => setModal(null)} />}
      {modal === "ai" && <AiAssistantModal onClose={() => setModal(null)} />}
    </>
  );
}

export default function ApiTesterPage() {
  return (
    <WorkflowProvider>
      <ApiTesterProvider>
        <ApiTesterShell />
      </ApiTesterProvider>
    </WorkflowProvider>
  );
}
