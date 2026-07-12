"use client";

import { useState } from "react";
import { useToast } from "@/providers/toast-provider";
import { requestPasswordReset } from "@/lib/auth-client";
import { validateEmail } from "@/lib/validators/auth-input";

/**
 * Mirrors useLoginForm()/useSignupForm() — state + handlers live here,
 * DesktopForgotPasswordView/MobileForgotPasswordView just render around it.
 *
 * Same junk-email guard as signup/login: no point sending a reset link to
 * a temp-mail address. On success we always show the same "check your
 * email" message regardless of whether the account exists, so we don't
 * leak which emails are registered.
 */
export function useForgotPasswordForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast("Enter your email address");
      return;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      toast(emailCheck.reason);
      return;
    }

    setSubmitting(true);
    const { error } = await requestPasswordReset({
      email: email.trim().toLowerCase(),
      redirectTo: "/reset-password",
    });
    setSubmitting(false);

    if (error) {
      toast(error.message || "Could not send reset link. Please try again.");
      return;
    }

    setSent(true);
  };

  return {
    email,
    setEmail,
    submitting,
    sent,
    handleSubmit,
  };
}
