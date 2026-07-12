"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, LayoutDashboard, LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import { useSession, signOut } from "@/lib/auth-client";
import { useToast } from "@/providers/toast-provider";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

type UserMenuProps = {
  /** "desktop" = 30px, matches Topbar's existing icon-button sizing.
   *  "mobile" = 36px (h-9 w-9), matches MobileHeader's other icon buttons. */
  size?: "desktop" | "mobile";
};

const SIZE_CLASSES: Record<"desktop" | "mobile", string> = {
  desktop: "h-[30px] w-[30px] text-[11px]",
  mobile: "h-9 w-9 text-[12px]",
};

/**
 * Single source of truth for "who's logged in" in the header. Renders:
 *  - a blank placeholder while the session is loading (avoids a layout flash)
 *  - a "Sign In" button when logged out
 *  - an avatar (OAuth photo, or initials fallback) with a dropdown when logged in
 * Used directly inside Topbar.tsx (desktop) and MobileHeader.tsx (mobile) so
 * every page gets it for free without per-page wiring.
 */
export default function UserMenu({ size = "desktop" }: UserMenuProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  if (isPending) {
    return <div className={`flex-shrink-0 rounded-full ${SIZE_CLASSES[size]}`} />;
  }

  if (!session) {
    return (
      <Button href="/login" variant="outline" size="md" className="flex-shrink-0">
        Sign In
      </Button>
    );
  }

  const { user } = session;
  const initials = getInitials(user.name, user.email);

  const handleSignOut = async () => {
    await signOut();
    toast("Signed out");
    router.push("/");
    router.refresh();
  };

  return (
    <Dropdown
      align="right"
      trigger={({ toggle }) => (
        <button
          onClick={toggle}
          aria-label="Account menu"
          className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(140deg,var(--secondary),var(--primary))] font-[family-name:var(--font-mono)] font-bold text-white ${SIZE_CLASSES[size]}`}
        >
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "Profile"}
              width={36}
              height={36}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            initials
          )}
        </button>
      )}
    >
      {(close) => (
        <div className="flex w-[220px] flex-col">
          <div className="border-b border-[var(--border-soft)] px-2.5 py-2">
            <p className="truncate text-[13px] font-semibold text-[var(--text)]">{user.name}</p>
            <p className="truncate text-[11.5px] text-[var(--text-faint)]">{user.email}</p>
          </div>
          <Link
            href="/profile"
            onClick={close}
            className="mt-1 flex items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
          >
            <User size={15} /> Profile
          </Link>
          <Link
            href="/workspace/dashboard"
            onClick={close}
            className="flex items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] text-[var(--text-dim)] transition-colors duration-150 hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
          >
            <LayoutDashboard size={15} /> Dashboard
          </Link>
          <button
            onClick={() => {
              close();
              handleSignOut();
            }}
            className="flex items-center gap-2 rounded-[7px] px-2.5 py-2 text-left text-[13px] text-[var(--danger)] transition-colors duration-150 hover:bg-[var(--card-hover)]"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </Dropdown>
  );
}
