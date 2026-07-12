"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/toast-provider";
import { useSession, updateUser, signOut } from "@/lib/auth-client";

/**
 * Same pattern as useLoginForm()/useSignupForm(): all state + handlers live
 * here, the Desktop/Mobile profile views just render around it.
 */
export function useProfile() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Redirect signed-out users — profile is an authenticated-only page.
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  // Seed the editable name field once the session loads (or changes).
  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session?.user?.name]);

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast("Name can't be empty");
      return;
    }
    setSaving(true);
    const { error } = await updateUser({ name: name.trim() });
    setSaving(false);

    if (error) {
      toast(error.message || "Couldn't update your name");
      return;
    }
    toast("Profile updated");
    refetch();
  };

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "Upload failed");
        return;
      }

      const { error } = await updateUser({ image: data.url });
      if (error) {
        toast(error.message || "Couldn't save your photo");
        return;
      }
      toast("Photo updated");
      refetch();
    } catch {
      toast("Upload failed — check your connection and try again");
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast("Signed out");
    router.push("/");
    router.refresh();
  };

  return {
    session,
    isPending,
    name,
    setName,
    saving,
    handleSaveName,
    uploading,
    handleAvatarUpload,
    handleSignOut,
  };
}
