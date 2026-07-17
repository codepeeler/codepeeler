"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, Sparkles } from "lucide-react";
import { ADMIN_NAV, ADMIN_DASHBOARD_LEAF } from "@/lib/data/admin-nav";

/**
 * Full-tree sidebar for the admin panel — every group/item from the product
 * spec is here, whether or not it has a real page behind it yet (unbuilt
 * ones fall through to the coming-soon catch-all, see app/admin/[...slug]).
 * Sections auto-expand when the current route is inside them.
 */
export default function AdminSidebar() {
  const pathname = usePathname();
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
    <aside className="flex h-full w-[248px] flex-shrink-0 flex-col border-r border-[#24262E] bg-[#111318]">
      <div className="flex items-center gap-2 border-b border-[#1A1C22] px-5 py-[18px]">
        <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#6D5DF6] to-[#4F9DFF]">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="font-[family-name:var(--font-display)] text-[16px] font-bold text-[#F4F4F6]">CodePeeler</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <Link
          href={ADMIN_DASHBOARD_LEAF.href}
          className={`mb-2 flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[13px] font-semibold transition-colors ${
            isActive("/admin") ? "bg-[#6D5DF6] text-white" : "text-[#9A9CA6] hover:bg-[#151822] hover:text-[#F4F4F6]"
          }`}
        >
          <LayoutDashboard size={15} />
          Dashboard
        </Link>

        {ADMIN_NAV.map((group) => {
          const open = openSections.has(group.section);
          const groupActive = group.items.some((i) => isActive(i.href));
          const Icon = group.icon;
          return (
            <div key={group.section} className="mb-0.5">
              <button
                onClick={() => toggle(group.section)}
                className={`flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-left text-[11.5px] font-bold uppercase tracking-[0.04em] transition-colors ${
                  groupActive ? "text-[#F4F4F6]" : "text-[#5D5F6B] hover:text-[#9A9CA6]"
                }`}
              >
                <Icon size={13} className="flex-shrink-0" />
                <span className="flex-1 truncate normal-case tracking-normal text-[12.5px] font-semibold">{group.section}</span>
                <ChevronDown size={13} className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>

              {open && (
                <div className="ml-[26px] mt-0.5 flex flex-col gap-0.5 border-l border-[#1A1C22] pl-3">
                  {group.items.map((item) => (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className={`rounded-[6px] px-2.5 py-1.5 text-[12.5px] transition-colors ${
                        isActive(item.href)
                          ? "bg-[#6D5DF61A] font-semibold text-[#6D5DF6]"
                          : "text-[#9A9CA6] hover:bg-[#151822] hover:text-[#F4F4F6]"
                      }`}
                    >
                      {item.label}
                      {!item.ready && <span className="ml-1.5 text-[9.5px] font-medium text-[#5D5F6B]">soon</span>}
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
