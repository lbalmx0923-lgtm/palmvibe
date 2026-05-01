import Link from "next/link";
import { ArrowRight, HeartHandshake, Lock, ScanLine } from "lucide-react";
import { LegalFooter } from "./components/legal-footer";

const features = [
  {
    title: "AI Palm Reading",
    description: "Analyze your palm traits and uncover your emotional pattern.",
    icon: ScanLine,
  },
  {
    title: "Love Compatibility",
    description: "Compare two palms and reveal connection strengths instantly.",
    icon: HeartHandshake,
  },
  {
    title: "Private & Instant",
    description: "No account required. Your preview is generated in moments.",
    icon: Lock,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      <div className="mx-auto flex w-full max-w-md flex-col px-4 pb-12 pt-5 sm:max-w-2xl sm:px-6">
        <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <span className="text-base font-semibold tracking-wide">PalmVibe</span>
          <Link
            href="/upload?mode=single"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#09090f] transition hover:bg-white/90"
          >
            Start Reading
          </Link>
        </nav>

        <main className="mt-10 flex flex-col gap-7">
          <section className="space-y-4">
            <p className="inline-flex rounded-full border border-violet-300/30 bg-violet-400/10 px-3 py-1 text-xs text-violet-200">
              AI-Powered Love Insight
            </p>
            <h1 className="text-4xl font-semibold leading-tight">
              Discover your love pattern through your palm.
            </h1>
            <p className="text-sm leading-6 text-zinc-300">
              PalmVibe uses AI to read emotional tendencies from your palm and
              generate a love compatibility preview made for modern relationships.
            </p>
            <div className="grid grid-cols-1 gap-3 pt-1">
              <Link
                href="/upload?mode=single"
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold transition hover:bg-violet-400"
              >
                Start Palm Reading
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/upload?mode=compatibility"
                className="flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                Check Compatibility
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-xl shadow-black/30">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">
              Preview Result
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex justify-between rounded-lg bg-white/5 px-3 py-2">
                <span className="text-zinc-300">Palm Vibe</span>
                <span className="font-medium">Quiet Observer</span>
              </p>
              <p className="flex justify-between rounded-lg bg-white/5 px-3 py-2">
                <span className="text-zinc-300">Love Style</span>
                <span className="font-medium">Deep but guarded</span>
              </p>
              <p className="flex justify-between rounded-lg bg-white/5 px-3 py-2">
                <span className="text-zinc-300">Compatibility</span>
                <span className="font-medium text-emerald-300">82%</span>
              </p>
            </div>
          </section>

          <section className="grid gap-3">
            {features.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <Icon size={18} className="text-violet-300" />
                <h2 className="mt-3 text-base font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-zinc-300">{description}</p>
              </article>
            ))}
          </section>
        </main>
        <LegalFooter />
      </div>
    </div>
  );
}
