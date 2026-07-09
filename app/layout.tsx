import type { Metadata, Viewport } from "next";
import { inter, spaceGrotesk, jetbrainsMono } from "@/lib/fonts";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { CommandPaletteProvider } from "@/providers/command-palette-provider";
import CommandPalette from "@/components/core/CommandPalette";
import Topbar from "@/components/layout/Topbar";
import MobileShell from "@/components/layout/mobile/MobileShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodePeeler — Your All-in-One Developer Workspace",
  description:
    "Format, convert, decode, and generate — chain tools together into workflows. Everything runs locally in your browser.",
};

// Required for mobile browsers to render at true device width instead of
// desktop-scaled zoom-out. `viewportFit: "cover"` lets safe-area-inset-*
// CSS vars (used across the mobile shell) work correctly on notched devices.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ToastProvider>
            <CommandPaletteProvider>
              <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
                <Topbar />
                <MobileShell>{children}</MobileShell>
              </div>
              <CommandPalette />
            </CommandPaletteProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
