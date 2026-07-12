"use client";

import { MailWarning, ArrowRight } from "lucide-react";
import { useVerifyEmailBanner } from "@/hooks/use-verify-email-banner";

/**
 * Shown at the top of the dashboard when the signed-in user's email isn't
 * verified yet. Two stages: a compact prompt with a "Verify now" button,
 * and (once clicked) an inline OTP field — verifying updates the session
 * and the banner disappears on its own.
 */
export default function VerifyEmailBanner() {
  const {
    shouldShow,
    email,
    stage,
    otp,
    setOtp,
    sending,
    verifying,
    resendCooldown,
    handleSendOtp,
    handleResendOtp,
    handleVerifyOtp,
    handleCancel,
  } = useVerifyEmailBanner();

  if (!shouldShow) return null;

  return (
    <div className="mb-6 rounded-[12px] border border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] p-4">
      {stage === "prompt" ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <MailWarning size={17} className="flex-shrink-0 text-[var(--warning)]" />
            <p className="text-[13px] text-[var(--text)]">
              <span className="font-semibold">Verify your email</span> — {email} isn&apos;t verified yet.
            </p>
          </div>
          <button
            onClick={handleSendOtp}
            disabled={sending}
            className="flex h-8 items-center gap-1.5 rounded-[8px] bg-[var(--warning)] px-3 text-[12px] font-semibold text-[var(--bg)] transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending…" : "Verify now"}
            {!sending && <ArrowRight size={13} />}
          </button>
        </div>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <MailWarning size={17} className="flex-shrink-0 text-[var(--warning)]" />
            <p className="text-[13px] text-[var(--text)]">
              Code sent to <span className="font-medium">{email}</span>
            </p>
          </div>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="h-8 w-28 rounded-[8px] border border-[var(--border)] bg-[var(--card)] px-2.5 text-center text-[13px] font-semibold tracking-[0.3em] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--primary)]"
          />
          <button
            type="submit"
            disabled={verifying}
            className="flex h-8 items-center gap-1.5 rounded-[8px] bg-[var(--warning)] px-3 text-[12px] font-semibold text-[var(--bg)] transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifying ? "Verifying…" : "Verify"}
          </button>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0}
            className="text-[12px] font-medium text-[var(--text-dim)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend code"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="text-[12px] font-medium text-[var(--text-faint)] hover:text-[var(--text-dim)]"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
