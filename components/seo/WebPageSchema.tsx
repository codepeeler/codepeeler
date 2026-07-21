import JsonLd from "./JsonLd";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

export default function WebPageSchema({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };
  return <JsonLd data={data} />;
}
