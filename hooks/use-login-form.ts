"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/toast-provider";
import { signIn } from "@/lib/auth-client";

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

    setSubmitting(true);

    const { error } = await signIn.email({
      email: email.trim(),
      password,
      rememberMe,
    });

    setSubmitting(false);

    if (error) {
      toast(error.message || "Login failed. Please check your credentials.");
      return;
    }

    toast("Signed in — redirecting to your dashboard");
    router.push("/workspace/dashboard");
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