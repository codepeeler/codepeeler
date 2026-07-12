"use client";

import { useIsMobile } from "@/hooks/use-media-query";
import DesktopSignupView from "@/components/auth/DesktopSignupView";
import MobileSignupView from "@/components/auth/MobileSignupView";

/**
 * Mirrors app/login/page.tsx — excluded from global chrome via RootShell,
 * mobile/desktop fully separate layouts, sharing only useSignupForm().
 */
export default function SignupPage() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileSignupView /> : <DesktopSignupView />;
}
