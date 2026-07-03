import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});