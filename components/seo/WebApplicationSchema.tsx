import JsonLd from "./JsonLd";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo";

/**
 * Sitewide schema — render this once, in the root layout.
 */
export default function WebApplicationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (runs in browser)",
    description: DEFAULT_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
  return <JsonLd data={data} />;
}
