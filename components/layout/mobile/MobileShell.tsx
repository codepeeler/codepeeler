"use client";

import { MobileShellProvider } from "@/providers/mobile-shell-provider";
import BottomTabBar from "@/components/layout/mobile/BottomTabBar";

/**
 * Wraps the whole app (alongside the existing desktop Topbar/AppShell) so
 * that every page automatically gets:
 *  - shared drawer/panel open state (MobileShellProvider)
 *  - the site-wide bottom tab bar
 *  - bottom safe-area spacing so content isn't hidden behind the tab bar
 *
 * This component renders on every screen size; the tab bar and drawers
 * hide themselves above the `lg` breakpoint via `lg:hidden`, so there is
 * no separate "desktop shell" to keep in sync — one tree, CSS-gated.
 */
export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <MobileShellProvider>
      {/* Reserve space for the fixed bottom tab bar on mobile only. */}
      <div className="pb-[64px] lg:pb-0">{children}</div>
      <BottomTabBar />
    </MobileShellProvider>
  );
}
