"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, LayoutDashboard, Sparkles } from "lucide-react";
import { ADMIN_NAV, ADMIN_DASHBOARD_LEAF } from "@/lib/data/admin-nav";

/**
 * Full-tree sidebar for the admin panel — every group/item from the product
 * spec is here, whether or not it has a real page behind it yet (unbuilt
 * ones fall through to the coming-soon catch-all, see app/admin/[...slug]).
 * Sections auto-expand when the current route is inside them.
 *
 * Collapsible: the whole rail toggles between the full 248px view (labels,
 * expandable sections — same layout as the reference design) and a 68px
 * icon-only rail. Collapse state lives here (not lifted to AdminLayout)
 * since only this component's own width changes — no parent needs to know.
 * Clicking a group's icon while collapsed re-expands the rail and opens
 * that section, rather than doing nothing.
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(ADMIN_NAV.filter((g) => g.items.some((i) => pathname.startsWith(i.href) && i.href !== "/admin"))
      .map((g) => g.section))
  );

  const toggle = (section: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(section) ? next.delete(section) : next.add(section);
      return next;
    });

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <aside
      className={`flex h-full flex-shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] transition-[width] duration-200 ${
        collapsed ? "w-[68px]" : "w-[248px]"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-[var(--border-soft)] px-5 py-[18px]">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
          <Sparkles size={16} className="text-white" />
        </div>
        {!collapsed && <span className="font-[family-name:var(--font-display)] truncate text-[16px] font-bold text-[var(--text)]">CodePeeler</span>}
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto flex-shrink-0 rounded-[6px] p-1 text-[var(--text-faint)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <Link
          href={ADMIN_DASHBOARD_LEAF.href}
          title={collapsed ? "Dashboard" : undefined}
          className={`mb-2 flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[13px] font-semibold transition-colors ${
            isActive("/admin") ? "bg-[var(--primary)] text-white" : "text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
          }`}
        >
          <LayoutDashboard size={15} className="flex-shrink-0" />
          {!collapsed && "Dashboard"}
        </Link>

        {ADMIN_NAV.map((group) => {
          const open = !collapsed && openSections.has(group.section);
          const groupActive = group.items.some((i) => isActive(i.href));
          const Icon = group.icon;
          return (
            <div key={group.section} className="mb-0.5">
              <button
                onClick={() => {
                  if (collapsed) {
                    setCollapsed(false);
                    setOpenSections((prev) => new Set(prev).add(group.section));
                  } else {
                    toggle(group.section);
                  }
                }}
                title={collapsed ? group.section : undefined}
                className={`flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-left text-[11.5px] font-bold uppercase tracking-[0.04em] transition-colors ${
                  groupActive ? "text-[var(--text)]" : "text-[var(--text-faint)] hover:text-[var(--text-dim)]"
                }`}
              >
                <Icon size={13} className="flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate normal-case tracking-normal text-[12.5px] font-semibold">{group.section}</span>
                    <ChevronDown size={13} className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                  </>
                )}
              </button>

              {open && (
                <div className="ml-[26px] mt-0.5 flex flex-col gap-0.5 border-l border-[var(--border-soft)] pl-3">
                  {group.items.map((item) => (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className={`rounded-[6px] px-2.5 py-1.5 text-[12.5px] transition-colors ${
                        isActive(item.href)
                          ? "bg-[var(--primary-dim)] font-semibold text-[var(--primary)]"
                          : "text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
                      }`}
                    >
                      {item.label}
                      {!item.ready && <span className="ml-1.5 text-[9.5px] font-medium text-[var(--text-faint)]">soon</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
