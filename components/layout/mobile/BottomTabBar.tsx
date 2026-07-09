"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOBILE_TAB_ITEMS } from "@/lib/data/workspace-shell";

/**
 * Site-wide bottom navigation. This is the one piece of chrome that makes
 * the whole site feel like a single app rather than a collection of pages —
 * it is rendered once, in MobileShell, and never re-implemented per page.
 */
export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[90] flex border-t border-[var(--border-soft)] bg-[var(--bg-elev)]/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {MOBILE_TAB_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[10.5px] font-medium",
              isActive ? "text-[var(--primary)]" : "text-[var(--text-faint)]"
            )}
          >
            <item.icon size={20} className={isActive ? "opacity-100" : "opacity-80"} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
