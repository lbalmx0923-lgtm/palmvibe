import Link from "next/link";
import type { ReactNode } from "react";

type LegalPageLayoutProps = {
  title: string;
  children: ReactNode;
};

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#09090f] px-4 py-8 text-white pb-14 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <header className="space-y-4 border-b border-white/10 pb-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
            PalmVibe
          </p>
          <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <Link
            href="/"
            className="block text-center text-sm text-zinc-300 underline underline-offset-4 decoration-white/25 transition hover:text-white"
          >
            Back to Home
          </Link>
        </header>

        <article className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20 sm:p-8">
          <div className="space-y-8 text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}
