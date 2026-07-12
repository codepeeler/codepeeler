"use client";

import { useIsMobile } from "@/hooks/use-media-query";
import DesktopForgotPasswordView from "@/components/auth/DesktopForgotPasswordView";
import MobileForgotPasswordView from "@/components/auth/MobileForgotPasswordView";

/**
 * Mirrors app/login/page.tsx — excluded from global chrome via RootShell,
 * mobile/desktop fully separate layouts, sharing only useForgotPasswordForm().
 */
export default function ForgotPasswordPage() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileForgotPasswordView /> : <DesktopForgotPasswordView />;
}
