import type { Metadata } from "next";

export const SITE_URL = "https://codepeeler.in";
export const SITE_NAME = "CodePeeler";
export const DEFAULT_TITLE = "CodePeeler — Your All-in-One Developer Workspace";
export const DEFAULT_DESCRIPTION =
  "Format, convert, decode, and generate — chain developer tools together into workflows. Everything runs locally in your browser.";

/**
 * The site has no translated content yet. These 5 hreflang values all point
 * at the same URL on purpose — this is the standard "single content,
 * multi-region English targeting" pattern (self-referencing + en-US/en-GB/
 * en-IN/x-default), not a mistake. Swap to real per-locale URLs if/when the
 * site actually ships translated pages.
 */
const HREFLANG_LOCALES = ["en", "en-US", "en-GB", "en-IN", "x-default"] as const;

export function absoluteUrl(path: string): string {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type BuildMetadataArgs = {
  /** Site-relative path, e.g. "/tools/json-formatter" or "/" for home. */
  path: string;
  title: string;
  description?: string;
  /** Set true for admin/workspace/auth/private pages — keeps them out of Google. */
  noIndex?: boolean;
  /** Override the default OG image (relative or absolute URL). */
  image?: string;
};

export function buildMetadata({
  path,
  title,
  description = DEFAULT_DESCRIPTION,
  noIndex = false,
  image,
}: BuildMetadataArgs): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ?? absoluteUrl("/opengraph-image");

  const languages: Record<string, string> = {};
  for (const locale of HREFLANG_LOCALES) {
    languages[locale] = url;
  }

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
  };
}
