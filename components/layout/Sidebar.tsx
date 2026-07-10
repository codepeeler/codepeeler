"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_RAIL_ITEMS } from "@/lib/data/workspace-shell";
import Drawer from "@/components/layout/mobile/Drawer";

export const SIDEBAR_PANEL_ID = "sidebar";

function SidebarContent({
  collapsed,
  onToggleCollapse,
  showCollapseButton,
}: {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  showCollapseButton: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      {showCollapseButton && (
        <div className="flex items-center justify-end px-2.5 pb-1 pt-2.5">
          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
          >
            <ChevronLeft size={14} className={cn("transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>
      )}

      <div className="px-2 pb-2 pt-1">
        {NAV_RAIL_ITEMS.map(({ key, label, href, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            className={cn(
              "mb-px flex items-center gap-2.5 rounded-lg px-[9px] py-2 text-[12.5px] font-semibold text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]",
              pathname === href && "bg-[var(--primary-dim)] text-[var(--primary)]"
            )}
          >
            <Icon size={15} className="flex-shrink-0 opacity-85" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </div>
    </>
  );
}

/**
 * Desktop: fixed-width collapsible aside (unchanged behavior).
 * Mobile (<lg): rendered inside the shared Drawer, opened via AppShell's
 * MobileHeader menu action. This is the one sidebar shared by all 50+ tool
 * pages (via AppShell), so fixing it here fixes all of them at once.
 */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <nav
        style={{ width: collapsed ? "64px" : "var(--w-navrail)" }}
        className="z-[40] hidden flex-shrink-0 flex-col overflow-y-auto border-r border-[var(--border-soft)] bg-[var(--bg-elev)] transition-[width] duration-150 lg:flex"
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} showCollapseButton />
      </nav>
      <Drawer id={SIDEBAR_PANEL_ID} title="Menu">
        <SidebarContent collapsed={false} showCollapseButton={false} />
      </Drawer>
    </>
  );
}
