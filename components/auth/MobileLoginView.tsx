"use client";

import { ShieldCheck } from "lucide-react";
import Logo from "@/components/core/Logo";
import LoginFormCard from "@/components/auth/LoginFormCard";
import { useLoginForm } from "@/hooks/use-login-form";

export default function MobileLoginView() {
  const form = useLoginForm();

  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--bg)] px-5 py-8 text-[var(--text)]"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
    >
      <div className="mb-7 flex flex-col items-center">
        <Logo width={130} height={34} />
        <p className="mt-2 text-[13px] text-[var(--text-dim)]">Welcome back, Developer 👋</p>
      </div>

      <LoginFormCard {...form} />

      <p className="mt-8 flex items-center gap-1.5 text-[10.5px] text-[var(--text-faint)]">
        <ShieldCheck size={12} className="text-[var(--success)]" />© 2026 CodePeeler
      </p>
    </div>
  );
}
