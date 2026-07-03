import type { Metadata } from "next";
import { inter, spaceGrotesk, jetbrainsMono } from "@/lib/fonts";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { CommandPaletteProvider } from "@/providers/command-palette-provider";
import AppShell from "@/components/layout/AppShell";
import CommandPalette from "@/components/core/CommandPalette";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodePeeler — Your All-in-One Developer Workspace",
  description:
    "Format, convert, decode, and generate — chain tools together into workflows. Everything runs locally in your browser.",
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
              <AppShell>{children}</AppShell>
              <CommandPalette />
            </CommandPaletteProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
