import Link from "next/link";

export function LegalFooter() {
  return (
    <footer className="mt-10 border-t border-white/10 pt-8">
      <nav
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-zinc-400 sm:text-sm"
        aria-label="Legal"
      >
        <Link
          href="/privacy"
          className="underline decoration-white/25 underline-offset-4 transition hover:text-white"
        >
          Privacy
        </Link>
        <span className="hidden text-white/20 sm:inline" aria-hidden="true">
          ·
        </span>
        <Link
          href="/terms"
          className="underline decoration-white/25 underline-offset-4 transition hover:text-white"
        >
          Terms
        </Link>
        <span className="hidden text-white/20 sm:inline" aria-hidden="true">
          ·
        </span>
        <Link
          href="/refund"
          className="underline decoration-white/25 underline-offset-4 transition hover:text-white"
        >
          Refund Policy
        </Link>
      </nav>
      <p className="mt-4 text-center text-xs text-zinc-500">
        PalmVibe is for entertainment and self-reflection only.
      </p>
    </footer>
  );
}
