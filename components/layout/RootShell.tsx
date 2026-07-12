"use client";

import { usePathname } from "next/navigation";
import Topbar from "@/components/layout/Topbar";
import MobileShell from "@/components/layout/mobile/MobileShell";

// Routes that render their own full-screen layout (no topbar, sidebar
// drawer, or bottom tab bar) — currently just the auth pages.
const NO_CHROME_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (NO_CHROME_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <Topbar />
      <MobileShell>{children}</MobileShell>
    </>
  );
}
