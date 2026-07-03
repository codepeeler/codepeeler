import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <Topbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
