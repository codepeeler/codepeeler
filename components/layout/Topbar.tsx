"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Bell } from "lucide-react";
import Logo from "@/components/core/Logo";
import ThemeToggle from "@/components/core/ThemeToggle";
import { TOPNAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCommandPalette } from "@/providers/command-palette-provider";

export default function Topbar() {
  const pathname = usePathname();
  const { open } = useCommandPalette();

  return (
    <header className="sticky top-0 z-50 flex h-[60px] flex-shrink-0 items-center gap-5 border-b border-[var(--border-soft)] bg-[var(--bg)]/85 px-5 backdrop-blur-md">
      <Logo width={150} height={42} />

      <nav className="hidden flex-shrink-0 items-center gap-0.5 md:flex">
        {TOPNAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-[7px] px-3 py-2 text-[13.5px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]",
              pathname === link.href && "bg-[var(--card)] text-[var(--text)]"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={open}
        className="ml-2 flex h-9 max-w-[380px] flex-1 items-center gap-2 rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[var(--text-faint)] transition-colors duration-150 hover:border-[var(--text-faint)]"
      >
        <Search size={15} className="flex-shrink-0" />
        <span className="flex-1 text-left text-[13px] text-[var(--text-faint)]">
          Search tools...
        </span>
        <span className="rounded-[5px] border border-[var(--border)] bg-[var(--border-soft)] px-[5px] py-0.5 font-[family-name:var(--font-mono)] text-[10.5px] text-[var(--text-faint)]">
          ⌘K
        </span>
      </button>

      <div className="ml-auto flex flex-shrink-0 items-center gap-2">
        <ThemeToggle />
        <button
          title="Notifications"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-lg text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
        >
          <Bell size={17} />
        </button>
        <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(140deg,var(--secondary),var(--primary))] font-[family-name:var(--font-mono)] text-[11px] font-bold text-white">
          JD
        </div>
      </div>
    </header>
  );
}
