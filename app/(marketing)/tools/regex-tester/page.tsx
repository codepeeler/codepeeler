import type { Metadata } from "next";
import ToolClient from "./ToolClient";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import WebPageSchema from "@/components/seo/WebPageSchema";
import { buildMetadata } from "@/lib/seo";

const PAGE_TITLE = "Regex Tester";
const PAGE_DESC = "Test & debug patterns";
const PAGE_PATH = "/tools/regex-tester";

export const metadata: Metadata = buildMetadata({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESC,
});

export default function Page() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
          { name: PAGE_TITLE, path: PAGE_PATH },
        ]}
      />
      <WebPageSchema title={PAGE_TITLE} description={PAGE_DESC} path={PAGE_PATH} />
      <ToolClient />
    </>
  );
}
