"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/toast-provider";
import { signUp, signIn } from "@/lib/auth-client";

/**
 * All signup form state and handlers live here, mirroring useLoginForm().
 * DesktopSignupView and MobileSignupView each call this directly.
 */
export function useSignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast("Please fill in all fields");
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

    toast("Account created — redirecting to your dashboard");
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
  };
}
