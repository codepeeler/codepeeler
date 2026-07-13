"use client";

import { Suspense } from "react";
import { useIsMobile } from "@/hooks/use-media-query";
import DesktopSignupView from "@/components/auth/DesktopSignupView";
import MobileSignupView from "@/components/auth/MobileSignupView";

/**
 * Mirrors app/login/page.tsx — excluded from global chrome via RootShell,
 * mobile/desktop fully separate layouts, sharing only useSignupForm().
 * Wrapped in Suspense because useSignupForm() reads useSearchParams()
 * (needed for the inline OTP step reached via ?email=&autosend=1 from login).
 */
function SignupPageInner() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileSignupView /> : <DesktopSignupView />;
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageInner />
    </Suspense>
  );
}
