"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, ImageIcon } from "lucide-react";
import MobileHeader from "@/components/layout/mobile/MobileHeader";
import Button from "@/components/ui/Button";
import { useProfile } from "@/hooks/use-profile";

function ProfileSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <h2 className="text-[14px] font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-[12px] text-[var(--text-faint)]">{description}</p>}
      <div className="mt-3 rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">{children}</div>
    </div>
  );
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { session, isPending, name, setName, saving, handleSaveName, handleSignOut } = useProfile();

  // useProfile() redirects to /login when there's no session — this just
  // avoids a flash of the page's content while that redirect is in flight.
  if (isPending || !session) {
    return (
      <>
        <MobileHeader title="Profile" onBack={() => router.back()} />
        <div className="mx-auto max-w-[640px] px-4 py-5 lg:px-6 lg:py-7" />
      </>
    );
  }

  const { user } = session;
  const initials = getInitials(user.name, user.email);

  return (
    <>
      <MobileHeader title="Profile" onBack={() => router.back()} />
      <main className="mx-auto max-w-[640px] px-4 py-5 lg:px-6 lg:py-7">
        <div className="mb-7">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.01em]">
            Profile
          </h1>
          <p className="mt-1 text-[13.5px] text-[var(--text-dim)]">
            Manage your account details and how you appear across CodePeeler
          </p>
        </div>

        <ProfileSection title="Avatar">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(140deg,var(--secondary),var(--primary))] font-[family-name:var(--font-mono)] text-[18px] font-bold text-white">
              {user.image ? (
                <Image src={user.image} alt={user.name} width={64} height={64} className="h-full w-full object-cover" unoptimized />
              ) : (
                initials
              )}
            </div>
            <div>
              <button
                disabled
                title="Coming soon — will be enabled once file storage (Cloudflare R2) is set up"
                className="flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] px-3 py-[7px] text-[12px] font-medium text-[var(--text-faint)] opacity-60"
              >
                <ImageIcon size={13} /> Upload photo
              </button>
              <p className="mt-1.5 text-[11px] text-[var(--text-faint)]">
                {user.image
                  ? "Synced from your Google account"
                  : "Custom photo upload is coming soon"}
              </p>
            </div>
          </div>
        </ProfileSection>

        <ProfileSection title="Account details">
          <label className="mb-1.5 block text-[12.5px] font-medium text-[var(--text-dim)]">Name</label>
          <div className="mb-4 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 flex-1 rounded-[9px] border border-[var(--border)] bg-[var(--bg)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
            />
            <Button onClick={handleSaveName} disabled={saving || name.trim() === user.name} size="md">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>

          <label className="mb-1.5 block text-[12.5px] font-medium text-[var(--text-dim)]">Email</label>
          <input
            value={user.email}
            disabled
            className="h-10 w-full rounded-[9px] border border-[var(--border)] bg-[var(--bg-elev)] px-3 text-[13px] text-[var(--text-faint)] outline-none"
          />
          <p className="mt-1.5 text-[11px] text-[var(--text-faint)]">
            Email changes aren&apos;t supported yet — coming with the forgot-password flow.
          </p>
        </ProfileSection>

        <ProfileSection title="Danger zone">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-[9px] px-1 py-1.5 text-left text-[12.5px] font-medium text-[var(--danger)] transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--danger)_14%,transparent)]"
          >
            <LogOut size={14} /> Sign out
          </button>
        </ProfileSection>
      </main>
    </>
  );
}
