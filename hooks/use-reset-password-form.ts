"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/providers/toast-provider";
import { resetPassword } from "@/lib/auth-client";

/**
 * Mirrors useLoginForm()/useSignupForm(). The reset link from the forgot-
 * password email lands here as /reset-password?token=... (better-auth
 * appends that itself once the link is clicked) — we just read it back out
 * and send it along with the new password.
 */
export function useResetPasswordForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast("Reset link invalid ya expire ho chuka hai — dobara try karein");
      return;
    }
    if (!password.trim()) {
      toast("Enter a new password");
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
    const { error } = await resetPassword({ newPassword: password, token });
    setSubmitting(false);

    if (error) {
      toast(error.message || "Could not reset password. Please request a new link.");
      return;
    }

    toast("Password reset — please sign in");
    router.push("/login");
  };

  return {
    token,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    submitting,
    handleSubmit,
  };
}
