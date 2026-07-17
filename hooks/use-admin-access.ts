"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/toast-provider";
import { useSession } from "@/lib/auth-client";

/**
 * Same gate useAdminPanel used to do inline, now shared by app/admin/layout.tsx
 * so every route under /admin (not just the old single-page tab view) gets it.
 * The API routes (`requireAdminSession`) are still the real enforcement —
 * this is only here to avoid a UI flash for non-admins.
 */
export function useAdminAccess() {
  const { data: session, isPending: sessionPending } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const isAdmin = session?.user?.role === "admin";
  const checkingAccess = sessionPending || !session;

  useEffect(() => {
    if (sessionPending) return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (!isAdmin) {
      toast("You don't have access to the admin panel");
      router.push("/workspace/dashboard");
    }
  }, [sessionPending, session, isAdmin, router, toast]);

  return { isAdmin, checkingAccess, user: session?.user ?? null };
}
