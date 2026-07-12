"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/providers/toast-provider";
import { useSession, emailOtp } from "@/lib/auth-client";

const RESEND_COOLDOWN_SECONDS = 30;

/**
 * Drives VerifyEmailBanner. Two stages:
 *  - "prompt": compact banner with a "Verify now" button
 *  - "otp": inline 6-digit code field (sent via better-auth's emailOTP plugin)
 *
 * shouldShow is derived straight from the session — once the OTP is
 * verified, session.user.emailVerified flips to true on refetch and the
 * banner unmounts itself with no extra state to reset.
 */
export function useVerifyEmailBanner() {
  const { toast } = useToast();
  const { data: session, refetch } = useSession();

  const [stage, setStage] = useState<"prompt" | "otp">("prompt");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const email = session?.user?.email ?? "";
  const shouldShow = Boolean(session?.user) && session?.user?.emailVerified === false;

  const sendOtp = async () => {
    if (!email) return;
    setSending(true);
    const { error } = await emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    setSending(false);

    if (error) {
      toast(error.message || "Could not send code. Please try again.");
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    const ok = await sendOtp();
    if (!ok) return;
    setStage("otp");
    startCooldown();
    toast("Verification code sent");
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    const ok = await sendOtp();
    if (!ok) return;
    startCooldown();
    toast("Verification code resent");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast("Enter the 6-digit code");
      return;
    }

    setVerifying(true);
    const { error } = await emailOtp.verifyEmail({ email, otp });
    setVerifying(false);

    if (error) {
      toast(error.message || "Invalid or expired code. Please try again.");
      return;
    }

    toast("Email verified");
    setOtp("");
    setStage("prompt");
    await refetch();
  };

  const handleCancel = () => {
    setStage("prompt");
    setOtp("");
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setResendCooldown(0);
  };

  return {
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
  };
}
