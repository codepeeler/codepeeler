"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/providers/toast-provider";
import { signUp, signIn, emailOtp } from "@/lib/auth-client";
import { validateEmail, validateName } from "@/lib/validators/auth-input";

const RESEND_COOLDOWN_SECONDS = 30;

/**
 * All signup form state and handlers live here, mirroring useLoginForm().
 * DesktopSignupView and MobileSignupView each call this directly.
 *
 * OTP verification happens inline on this same page (step: "form" -> "otp")
 * instead of a separate /verify-email route. Also handles the case where
 * useLoginForm() redirects here with ?email=&autosend=1 for an unverified
 * account trying to log in.
 */
export function useSignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useSearchParams();

  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autosentRef = useRef(false);

  const redirect = params.get("redirect") || "/workspace/dashboard";

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

  // Arriving from login with an unverified account: jump straight to the
  // OTP step and send the first code ourselves.
  useEffect(() => {
    const paramEmail = params.get("email");
    const autosend = params.get("autosend") === "1";
    if (paramEmail && autosend && !autosentRef.current) {
      autosentRef.current = true;
      setEmail(paramEmail);
      setStep("otp");
      setSending(true);
      emailOtp.sendVerificationOtp({ email: paramEmail, type: "email-verification" }).then(({ error }) => {
        setSending(false);
        if (error) {
          toast(error.message || "Could not send code. Please try again.");
          return;
        }
        startCooldown();
      });
    }
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast("Please fill in all fields");
      return;
    }

    const nameCheck = validateName(name);
    if (!nameCheck.valid) {
      toast(nameCheck.reason);
      return;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      toast(emailCheck.reason);
      return;
    }

    if (password.length < 8) {
      toast("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast("Passwords do not match");
      return;
    }

    setSubmitting(true);

    const { error } = await signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    setSubmitting(false);

    if (error) {
      toast(error.message || "Could not create account. Please try again.");
      return;
    }

    // OTP is already sent server-side on signup (sendVerificationOnSignUp).
    toast("Account created — check your email for the verification code");
    setStep("otp");
    startCooldown();
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !email) return;
    setSending(true);
    const { error } = await emailOtp.sendVerificationOtp({ email, type: "email-verification" });
    setSending(false);

    if (error) {
      toast(error.message || "Could not send code. Please try again.");
      return;
    }
    startCooldown();
    toast("Verification code sent");
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

    toast("Email verified — signing you in");
    router.push(redirect);
    router.refresh();
  };

  const handleOAuth = async (provider: "google" | "github") => {
    toast(`Redirecting to ${provider}…`);
    await signIn.social({
      provider,
      callbackURL: "/workspace/dashboard",
    });
  };

  return {
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
  };
}
