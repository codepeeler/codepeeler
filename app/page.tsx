import Hero from "@/components/landing/Hero";
import PopularTools from "@/components/landing/PopularTools";
import WorkspaceFlow from "@/components/landing/WorkspaceFlow";
import Categories from "@/components/landing/Categories";
import ShortcutsCta from "@/components/landing/ShortcutsCta";
import Footer from "@/components/layout/Footer";
import MobileFooter from "@/components/layout/mobile/MobileFooter";

export default function Home() {
  return (
    <>
      <Hero />
      <PopularTools />
      <WorkspaceFlow />
      <Categories />
      <ShortcutsCta />
      <Footer />
      <MobileFooter variant="compact" />
    </>
  );
}
