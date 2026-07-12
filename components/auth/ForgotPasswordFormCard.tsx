"use client";

import Link from "next/link";
import { Mail, ShieldCheck, ArrowRight, MailCheck, ArrowLeft } from "lucide-react";
import type { useForgotPasswordForm } from "@/hooks/use-forgot-password-form";

export default function ForgotPasswordFormCard(props: ReturnType<typeof useForgotPasswordForm>) {
  const { email, setEmail, submitting, sent, handleSubmit } = props;

  if (sent) {
    return (
      <div className="w-full max-w-[420px]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_16%,transparent)]">
            <MailCheck size={20} className="text-[var(--success)]" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.01em]">
            Check your email
          </h1>
          <p className="mt-1.5 text-[13px] leading-[1.6] text-[var(--text-dim)]">
            If an account exists for <span className="font-medium text-[var(--text)]">{email}</span>, a password
            reset link has been sent. Ye link kuch der mein expire ho jaayega.
          </p>
        </div>

        <Link
          href="/login"
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-[9px] border border-[var(--border)] bg-[var(--card)] text-[13.5px] font-medium text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
        >
          <ArrowLeft size={15} /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-6 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.01em]">
          Forgot your password?
        </h1>
        <p className="mt-1.5 text-[13px] text-[var(--text-dim)]">
          Enter your email and we&apos;ll send you a reset link.{" "}
          <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="mb-1.5 block text-[12.5px] font-medium text-[var(--text-dim)]">Email address</label>
        <div className="relative mb-5">
          <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="h-11 w-full rounded-[9px] border border-[var(--border)] bg-[var(--card)] pl-9 pr-3 text-[13px] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-[9px] bg-[var(--primary)] text-[13.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-glow)] hover:brightness-[1.08] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send reset link"}
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
