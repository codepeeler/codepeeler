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
import { CodeSnippetModal, EnvironmentManagerModal, ImportModal, SaveRequestModal } from "@/components/api-tester/Modals";
import MobileHeader from "@/components/layout/mobile/MobileHeader";
import { useMobileShell } from "@/providers/mobile-shell-provider";

type ModalKey = "code" | "save" | "env" | "import" | null;

function ApiTesterShell() {
  const { activeTab, vars, send, cancel, duplicateTab, importFromCurl } = useApiTester();
  const { togglePanel } = useMobileShell();
  const [modal, setModal] = useState<ModalKey>(null);

  // keyboard shortcuts: Cmd/Ctrl+Enter send, Cmd/Ctrl+S save, Cmd/Ctrl+T new tab
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "Enter") { e.preventDefault(); send(); }
      else if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); if (activeTab) setModal("save"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [send, activeTab]);

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
            <UrlBar onOpenCode={() => setModal("code")} onOpenSave={() => setModal("save")} />
          </div>
          <div className="m-4 mt-2.5 flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex min-h-[220px] flex-[0_1_46%] flex-col overflow-hidden rounded-[14px] border border-[var(--border-soft)] bg-[var(--card)]">
              <RequestPanel />
            </div>
            <div className="flex min-h-[220px] flex-[1_1_54%] flex-col overflow-hidden rounded-[14px] border border-[var(--border-soft)] bg-[var(--card)]">
              <ResponsePanel />
            </div>
          </div>
        </main>
        <EnvironmentPanel onOpenManager={() => setModal("env")} />
      </div>

      {modal === "code" && <CodeSnippetModal request={activeTab.request} vars={vars} onClose={() => setModal(null)} />}
      {modal === "save" && <SaveRequestModal onClose={() => setModal(null)} />}
      {modal === "env" && <EnvironmentManagerModal onClose={() => setModal(null)} />}
      {modal === "import" && <ImportModal onClose={() => setModal(null)} />}
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
