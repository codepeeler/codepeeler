"use client";

import Link from "next/link";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, TriangleAlert } from "lucide-react";
import type { useResetPasswordForm } from "@/hooks/use-reset-password-form";

export default function ResetPasswordFormCard(props: ReturnType<typeof useResetPasswordForm>) {
  const {
    token,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    submitting,
    handleSubmit,
  } = props;

  if (!token) {
    return (
      <div className="w-full max-w-[420px]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--danger)_16%,transparent)]">
            <TriangleAlert size={20} className="text-[var(--danger)]" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.01em]">
            Link invalid or expired
          </h1>
          <p className="mt-1.5 text-[13px] leading-[1.6] text-[var(--text-dim)]">
            Ye reset link ab kaam nahi kar raha. Naya link mangwane ke liye dobara try karein.
          </p>
        </div>

        <Link
          href="/forgot-password"
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-[9px] bg-[var(--primary)] text-[13.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-glow)] hover:brightness-[1.08]"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-6 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.01em]">
          Set a new password
        </h1>
        <p className="mt-1.5 text-[13px] text-[var(--text-dim)]">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="mb-1.5 block text-[12.5px] font-medium text-[var(--text-dim)]">New password</label>
        <div className="relative mb-4">
          <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="h-11 w-full rounded-[9px] border border-[var(--border)] bg-[var(--card)] pl-9 pr-10 text-[13px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-dim)]"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <label className="mb-1.5 block text-[12.5px] font-medium text-[var(--text-dim)]">Confirm new password</label>
        <div className="relative mb-5">
          <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="h-11 w-full rounded-[9px] border border-[var(--border)] bg-[var(--card)] pl-9 pr-3 text-[13px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-[9px] bg-[var(--primary)] text-[13.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-glow)] hover:brightness-[1.08] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Reset password"}
          {!submitting && <ArrowRight size={15} />}
        </button>
      </form>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-[11.5px] text-[var(--text-faint)]">
        <ShieldCheck size={13} className="text-[var(--success)]" />
        Your data is encrypted and never shared.
      </p>
    </div>
  );
}
