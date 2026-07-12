"use client";

import { useIsMobile } from "@/hooks/use-media-query";
import DesktopLoginView from "@/components/auth/DesktopLoginView";
import MobileLoginView from "@/components/auth/MobileLoginView";

/**
 * This route is excluded from the global chrome (Topbar/BottomTabBar) via
 * RootShell — see components/layout/RootShell.tsx — since a sign-in screen
 * shouldn't show site navigation. Mobile and desktop are fully separate
 * layouts (no split-screen hero on mobile), sharing only useLoginForm().
 */
export default function LoginPage() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileLoginView /> : <DesktopLoginView />;
}
