"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

// next-themes injects an inline <script> to set the theme before hydration
// (this prevents a flash of the wrong theme). React 19 + Next.js 16.2 log a
// dev-only console error for any <script> rendered inside a component tree,
// even though this script runs correctly during SSR — it's a known false
// positive (next-themes hasn't shipped a fix). We just silence that one
// specific message in development; nothing else about console.error changes.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
