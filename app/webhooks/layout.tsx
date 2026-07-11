import { WebhookInboxProvider } from "@/providers/webhook-inbox-provider";

export default function WebhooksLayout({ children }: { children: React.ReactNode }) {
  return (
    // Mobile: MobileShell reserves 64px below (pb-[64px]) for its fixed
    // bottom tab bar; don't also claim the full 100dvh here or the page
    // becomes taller than the screen and scrolls as a whole. See collections
    // layout for the full explanation.
    <div className="flex h-[calc(100dvh-64px)] flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)] lg:h-[calc(100vh-60px)]">
      <WebhookInboxProvider>{children}</WebhookInboxProvider>
    </div>
  );
}
