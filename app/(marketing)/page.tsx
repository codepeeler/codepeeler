import Hero from "@/components/landing/Hero";
import PopularTools from "@/components/landing/PopularTools";
import WorkspaceFlow from "@/components/landing/WorkspaceFlow";
import Categories from "@/components/landing/Categories";
import ShortcutsCta from "@/components/landing/ShortcutsCta";

export default function Home() {
  return (
    <>
      <Hero />
      <PopularTools />
      <WorkspaceFlow />
      <Categories />
      <ShortcutsCta />
    </>
  );
}
