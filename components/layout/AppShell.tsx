import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex min-h-0 flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
