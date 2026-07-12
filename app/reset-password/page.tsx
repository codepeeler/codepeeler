"use client";

import { Suspense } from "react";
import { useIsMobile } from "@/hooks/use-media-query";
import DesktopResetPasswordView from "@/components/auth/DesktopResetPasswordView";
import MobileResetPasswordView from "@/components/auth/MobileResetPasswordView";

/**
 * Mirrors app/forgot-password/page.tsx. Wrapped in Suspense because
 * useResetPasswordForm() reads the reset token via useSearchParams(),
 * which Next requires to be inside a Suspense boundary.
 */
function ResetPasswordSwitcher() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileResetPasswordView /> : <DesktopResetPasswordView />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordSwitcher />
    </Suspense>
  );
}
