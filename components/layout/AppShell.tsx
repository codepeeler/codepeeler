"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import MobileFooter from "@/components/layout/mobile/MobileFooter";
import Sidebar, { SIDEBAR_PANEL_ID } from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/mobile/MobileHeader";
import { useMobileShell } from "@/providers/mobile-shell-provider";
import { TOOLS } from "@/lib/data/tools";

type AppShellProps = {
  children: React.ReactNode;
};

/**
 * Shared wrapper for the marketing site + all 50+ tool pages. Desktop keeps
 * its existing Sidebar + content layout untouched; on mobile it adds the one
 * header/menu pattern shared site-wide (MobileHeader + Sidebar's drawer),
 * so no individual tool page has to build its own mobile chrome.
 */
export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { togglePanel } = useMobileShell();

  const activeTool = TOOLS.find((t) => t.page === pathname);
  const title = activeTool?.name ?? "CodePeeler";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
      <MobileHeader
        title={title}
        actions={[
          {
            key: "menu",
            icon: Menu,
            label: "Menu",
            onClick: () => togglePanel(SIDEBAR_PANEL_ID),
          },
        ]}
      />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileFooter variant={activeTool ? "compact" : "full"} />
      </div>
    </div>
  );
}
