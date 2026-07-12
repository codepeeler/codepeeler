"use client";

import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Check, ShieldCheck, ArrowRight } from "lucide-react";
import { GithubIcon, GoogleIcon } from "@/components/auth/OAuthIcons";
import type { useLoginForm } from "@/hooks/use-login-form";

export default function LoginFormCard(props: ReturnType<typeof useLoginForm>) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    submitting,
    handleSubmit,
    handleOAuth,
  } = props;

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-6 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.01em]">
          Sign in to CodePeeler
        </h1>
        <p className="mt-1.5 text-[13px] text-[var(--text-dim)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-[var(--primary)] hover:underline">
            Sign up
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
        <div className="relative mb-3">
          <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
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

        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setRememberMe((v) => !v)}
            className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-dim)]"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-[5px] border ${
                rememberMe ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)]"
              }`}
            >
              {rememberMe && <Check size={11} className="text-white" />}
            </span>
            Remember me
          </button>
          <Link href="/forgot-password" className="text-[12.5px] font-medium text-[var(--primary)] hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-[9px] bg-[var(--primary)] text-[13.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-glow)] hover:brightness-[1.08] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
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
