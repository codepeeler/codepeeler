"use client";

import { useEffect, useState } from "react";

/**
 * Breakpoints mirror Tailwind's default `screens` scale.
 * This is the ONLY place breakpoint pixel values should be defined for JS logic.
 * CSS should keep using Tailwind's sm:/md:/lg:/xl: classes directly — this hook
 * is only for cases where actual conditional *logic* (not just styling) is needed,
 * e.g. choosing between <MobileShell> and <DesktopShell>.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Subscribes to a min-width media query. SSR-safe: returns `false` on the server
 * and during the first client render to avoid hydration mismatches, then syncs
 * to the real value after mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True when viewport is at or above the given breakpoint. */
export function useBreakpoint(bp: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[bp]}px)`);
}

/**
 * The single flag the rest of the app should use to decide between mobile
 * (app-like, bottom-tab, drawer-based) and desktop (sidebar-based) shells.
 * Cutoff is `lg` (1024px) — below this, workspace/api-tester style multi-column
 * layouts don't have room to breathe.
 */
export function useIsMobile(): boolean {
  const isLg = useBreakpoint("lg");
  return !isLg;
}
