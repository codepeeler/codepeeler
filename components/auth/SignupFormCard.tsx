"use client";

import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, MailCheck } from "lucide-react";
import { GithubIcon, GoogleIcon } from "@/components/auth/OAuthIcons";
import type { useSignupForm } from "@/hooks/use-signup-form";

export default function SignupFormCard(props: ReturnType<typeof useSignupForm>) {
  const {
    step,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    submitting,
    handleSubmit,
    handleOAuth,
    otp,
    setOtp,
    verifying,
    sending,
    resendCooldown,
    handleResendOtp,
    handleVerifyOtp,
  } = props;

  if (step === "otp") {
    return (
      <div className="w-full max-w-[420px]">
        <div className="rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]">
            <MailCheck size={22} className="text-[var(--primary)]" />
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-[22px] font-bold">Verify your email</h1>
          <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--text-dim)]">
            Enter the 6-digit code we sent to{" "}
            <span className="font-semibold text-[var(--text)]">{email}</span>
          </p>

          <form onSubmit={handleVerifyOtp} className="mt-6 flex flex-col items-center gap-4">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="h-12 w-full rounded-[10px] border border-[var(--border)] bg-[var(--bg)] px-3 text-center text-[20px] font-semibold tracking-[0.4em] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
            />

            <button
              type="submit"
              disabled={verifying}
              className="h-11 w-full rounded-[10px] bg-[var(--primary)] text-[14px] font-semibold text-[var(--bg)] transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verifying ? "Verifying…" : "Verify & continue"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={sending || resendCooldown > 0}
            className="mt-4 text-[12.5px] font-medium text-[var(--text-dim)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : sending ? "Sending…" : "Resend code"}
          </button>
        </div>

        <p className="mt-6 text-center text-[13px] text-[var(--text-dim)]">
          Wrong email?{" "}
          <Link href="/signup" className="font-semibold text-[var(--primary)] hover:underline">
            Sign up again
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-6 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.01em]">
          Create your account
        </h1>
        <p className="mt-1.5 text-[13px] text-[var(--text-dim)]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2">
        <button
          onClick={() => handleOAuth("github")}
          className="flex h-10 items-center justify-center gap-1.5 rounded-[9px] border border-[var(--border)] bg-[var(--card)] text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
        >
          <GithubIcon size={15} />
          <span className="hidden sm:inline">GitHub</span>
        </button>
        <button
          onClick={() => handleOAuth("google")}
          className="flex h-10 items-center justify-center gap-1.5 rounded-[9px] border border-[var(--border)] bg-[var(--card)] text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
        >
          <GoogleIcon size={15} />
          <span className="hidden sm:inline">Google</span>
        </button>
      </div>

      <div className="mb-5 flex items-center gap-3 text-[11px] font-medium text-[var(--text-faint)]">
        <div className="h-px flex-1 bg-[var(--border)]" />
        OR
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <form onSubmit={handleSubmit}>
        <label className="mb-1.5 block text-[12.5px] font-medium text-[var(--text-dim)]">Full name</label>
        <div className="relative mb-4">
          <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="h-11 w-full rounded-[9px] border border-[var(--border)] bg-[var(--card)] pl-9 pr-3 text-[13px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
        </div>

        <label className="mb-1.5 block text-[12.5px] font-medium text-[var(--text-dim)]">Email address</label>
        <div className="relative mb-4">
          <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="h-11 w-full rounded-[9px] border border-[var(--border)] bg-[var(--card)] pl-9 pr-3 text-[13px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
        </div>

        <label className="mb-1.5 block text-[12.5px] font-medium text-[var(--text-dim)]">Password</label>
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

        <label className="mb-1.5 block text-[12.5px] font-medium text-[var(--text-dim)]">Confirm password</label>
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
          {submitting ? "Creating account…" : "Create account"}
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
