"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Topbar from "@/components/layout/Topbar";
import MobileShell from "@/components/layout/mobile/MobileShell";
import { useSession } from "@/lib/auth-client";

// Routes that render their own full-screen layout (no topbar, sidebar
// drawer, or bottom tab bar) — currently just the auth pages.
const NO_CHROME_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/suspended"];

export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user && (session.user as any).banned && pathname !== "/suspended") {
      router.push("/suspended");
    }
  }, [session, pathname, router]);

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
