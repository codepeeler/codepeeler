import Link from "next/link";
import { Compass, Home } from "lucide-react";

export const metadata = {
  title: "Page Not Found — CodePeeler",
  description: "The page you're looking for doesn't exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-[var(--bg)] px-4 py-16 text-[var(--text)]">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-dim)] text-[var(--primary)]">
          <Compass size={30} />
        </div>

        <p className="font-[family-name:var(--font-mono)] text-sm font-semibold tracking-wide text-[var(--text-faint)]">
          404
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
          Page not found
        </h1>
        <p className="mx-auto mt-2.5 max-w-sm text-[13.5px] leading-relaxed text-[var(--text-dim)]">
          The page you&apos;re looking for doesn&apos;t exist, was moved, or the
          link is broken. Let&apos;s get you back on track.
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[9px] bg-[var(--primary)] px-5 py-[11px] text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-glow)] hover:brightness-[1.08] sm:w-auto"
          >
            <Home size={15} />
            Back to home
          </Link>
          <Link
            href="/workspace"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-5 py-[11px] text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--card-hover)] sm:w-auto"
          >
            Go to workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
