import JsonLd from "./JsonLd";
import { absoluteUrl } from "@/lib/seo";

export type Crumb = { name: string; path: string };

export default function BreadcrumbSchema({ items }: { items: Crumb[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
  return <JsonLd data={data} />;
}
