"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/toast-provider";
import { signIn } from "@/lib/auth-client";
import { validateEmail } from "@/lib/validators/auth-input";

/**
 * All login form state and handlers live here. DesktopLoginView and
 * MobileLoginView each call this directly (same pattern as
 * useDashboardData()/useSnippetsData()/useBlogData()), so submitting the
 * form behaves identically on both — only the layout around it differs.
 */
export function useLoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast("Enter your email and password");
      return;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      toast(emailCheck.reason);
      return;
    }

    setSubmitting(true);

    const { error } = await signIn.email({
      email: email.trim(),
      password,
      rememberMe,
    });

    setSubmitting(false);

    if (error) {
      const isUnverified =
        error.code === "EMAIL_NOT_VERIFIED" || /not verified/i.test(error.message || "");

      if (isUnverified) {
        toast("Please verify your email first — sending you a code");
        router.push(`/signup?email=${encodeURIComponent(email.trim())}&autosend=1`);
        return;
      }

      toast(error.message || "Login failed. Please check your credentials.");
      return;
    }

    toast("Signed in — redirecting to your dashboard");
    window.location.href = "/workspace/dashboard";
  };

  const handleOAuth = async (provider: "google" | "github") => {
    toast(`Redirecting to ${provider}…`);
    await signIn.social({
      provider,
      callbackURL: "/workspace/dashboard",
    });
  };

  return {
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
  };
}