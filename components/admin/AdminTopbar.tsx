"use client";

import { Bell, Search } from "lucide-react";
import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  user: { name: string; email: string; image?: string | null } | null;
};

export default function AdminTopbar({ title, subtitle, user }: Props) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#24262E] bg-[#0D0E11] px-6 py-4">
      <div className="min-w-0">
        <h1 className="font-[family-name:var(--font-display)] text-[20px] font-bold tracking-[-0.01em] text-[#F4F4F6]">{title}</h1>
        {subtitle && <p className="mt-0.5 truncate text-[12.5px] text-[#9A9CA6]">{subtitle}</p>}
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        <div className="hidden items-center gap-2 rounded-[8px] border border-[#24262E] bg-[#111318] px-3 py-1.5 text-[12.5px] text-[#5D5F6B] md:flex">
          <Search size={13} />
          <span>Search anything…</span>
        </div>
        <Link
          href="/admin/support/tickets"
          className="relative flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#24262E] text-[#9A9CA6] transition-colors hover:text-[#F4F4F6]"
        >
          <Bell size={15} />
        </Link>
        <div className="flex items-center gap-2 rounded-[8px] border border-[#24262E] py-1 pl-1 pr-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6D5DF6] text-[10px] font-bold text-white">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <span className="text-[12px] font-semibold text-[#F4F4F6]">{user?.name ?? "Admin"}</span>
        </div>
      </div>
    </header>
  );
}
