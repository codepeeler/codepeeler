"use client";

import { ShieldCheck } from "lucide-react";
import Logo from "@/components/core/Logo";
import ResetPasswordFormCard from "@/components/auth/ResetPasswordFormCard";
import { useResetPasswordForm } from "@/hooks/use-reset-password-form";

export default function MobileResetPasswordView() {
  const form = useResetPasswordForm();

  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--bg)] px-5 py-8 text-[var(--text)]"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
    >
      <div className="mb-7 flex flex-col items-center">
        <Logo width={130} height={34} />
        <p className="mt-2 text-[13px] text-[var(--text-dim)]">Almost there 🔑</p>
      </div>

      <ResetPasswordFormCard {...form} />

      <p className="mt-8 flex items-center gap-1.5 text-[10.5px] text-[var(--text-faint)]">
        <ShieldCheck size={12} className="text-[var(--success)]" />© 2026 CodePeeler
      </p>
    </div>
  );
}
