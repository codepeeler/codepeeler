"use client";

import { Ban, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

export default function SuspendedPage() {
  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1d1d29] px-4 text-[#F4F4F6]">
      <div className="w-full max-w-md rounded-[12px] border border-[#24262E] bg-[#111318] p-6 text-center shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EF4444]/10 text-[#EF4444]">
          <Ban size={28} />
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-[22px] font-bold tracking-tight">
          Account Suspended
        </h1>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#9A9CA6]">
          Your account has been suspended by an administrator for violating terms of service or code of conduct. If you believe this is a mistake, please contact support.
        </p>
        <button
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#EF4444] py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
}
