"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Mode = "single" | "compatibility";

type SingleReport = {
  palm_vibe: string;
  one_sentence_summary: string;
  free_preview: string[];
  full_report: Record<string, unknown>;
};

type CompatibilityReport = {
  compatibility_score: number;
  relationship_vibe: string;
  one_sentence_summary: string;
  free_preview: string[];
  full_report: Record<string, unknown>;
};

type StoredResult =
  | { mode: "single"; report: SingleReport }
  | { mode: "compatibility"; report: CompatibilityReport };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeInsights(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").slice(0, 3);
}

function parseStoredResult(): StoredResult | null {
  if (typeof window === "undefined") return null;

  const rawMode =
    sessionStorage.getItem("palmvibe_mode") ?? localStorage.getItem("palmvibe_mode");
  const rawReport =
    sessionStorage.getItem("palmvibe_report") ?? localStorage.getItem("palmvibe_report");

  if (!rawMode || !rawReport) return null;
  if (rawMode !== "single" && rawMode !== "compatibility") return null;

  try {
    const parsed = JSON.parse(rawReport) as unknown;
    if (!isRecord(parsed)) return null;

    if (rawMode === "single") {
      const palmVibe = typeof parsed.palm_vibe === "string" ? parsed.palm_vibe : "";
      const summary =
        typeof parsed.one_sentence_summary === "string" ? parsed.one_sentence_summary : "";
      const freePreview = normalizeInsights(parsed.free_preview);
      const fullReport = isRecord(parsed.full_report) ? parsed.full_report : {};

      return {
        mode: "single",
        report: {
          palm_vibe: palmVibe,
          one_sentence_summary: summary,
          free_preview: freePreview,
          full_report: fullReport,
        },
      };
    }

    const relationshipVibe =
      typeof parsed.relationship_vibe === "string" ? parsed.relationship_vibe : "";
    const summary =
      typeof parsed.one_sentence_summary === "string" ? parsed.one_sentence_summary : "";
    const compatibilityScore =
      typeof parsed.compatibility_score === "number" ? parsed.compatibility_score : 0;
    const freePreview = normalizeInsights(parsed.free_preview);
    const fullReport = isRecord(parsed.full_report) ? parsed.full_report : {};

    return {
      mode: "compatibility",
      report: {
        compatibility_score: compatibilityScore,
        relationship_vibe: relationshipVibe,
        one_sentence_summary: summary,
        free_preview: freePreview,
        full_report: fullReport,
      },
    };
  } catch {
    return null;
  }
}

function toLabel(key: string): string {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function FullReportSections({ fullReport }: { fullReport: Record<string, unknown> }) {
  const entries = Object.entries(fullReport);
  if (entries.length === 0) {
    return (
      <p className="text-sm text-zinc-400">No full report sections were saved with this reading.</p>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200"
        >
          <p className="text-xs font-semibold text-violet-200">{toLabel(key)}</p>
          <div className="mt-2 text-sm leading-relaxed text-zinc-300">
            <FullReportValue value={value} depth={0} />
          </div>
        </div>
      ))}
    </div>
  );
}

function FullReportValue({ value, depth }: { value: unknown; depth: number }) {
  if (value === null || value === undefined) {
    return <span className="text-zinc-500">—</span>;
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return <span>{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    return (
      <ul className={`list-disc space-y-1 pl-5 ${depth > 0 ? "mt-1" : ""}`}>
        {value.map((item, i) => (
          <li key={i}>
            <FullReportValue value={item} depth={depth + 1} />
          </li>
        ))}
      </ul>
    );
  }
  if (isRecord(value)) {
    return (
      <div className={`space-y-3 ${depth > 0 ? "mt-2 border-l border-white/15 pl-3" : ""}`}>
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <p className="text-xs font-medium text-zinc-400">{toLabel(k)}</p>
            <div className="mt-1">
              <FullReportValue value={v} depth={depth + 1} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <span>{JSON.stringify(value)}</span>;
}

type PaidStatus = "loading" | "paid" | "unpaid";

function resolveReportIdFromClient(): string | null {
  if (typeof window === "undefined") return null;
  return (
    new URLSearchParams(window.location.search).get("report_id") ??
    sessionStorage.getItem("palmvibe_report_id") ??
    localStorage.getItem("palmvibe_report_id")
  );
}

function ResultPageContent() {
  const storedResult = useMemo(() => parseStoredResult(), []);
  const [paidStatus, setPaidStatus] = useState<PaidStatus>(() => {
    if (typeof window === "undefined") return "unpaid";
    return resolveReportIdFromClient() ? "loading" : "unpaid";
  });

  useEffect(() => {
    const reportId = resolveReportIdFromClient();
    if (!reportId) {
      setPaidStatus("unpaid");
      return;
    }

    let cancelled = false;
    fetch(`/api/check-paid?report_id=${encodeURIComponent(reportId)}`)
      .then((response) =>
        response.json().catch(() => ({ paid: false })) as Promise<{ paid?: boolean }>
      )
      .then((data) => {
        if (cancelled) return;
        setPaidStatus(data.paid === true ? "paid" : "unpaid");
      })
      .catch(() => {
        if (!cancelled) setPaidStatus("unpaid");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!storedResult) {
    return (
      <main className="min-h-screen bg-[#09090f] px-4 py-6 text-white">
        <div className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 sm:max-w-xl">
          <h1 className="text-2xl font-semibold">
            No report found. Please upload your palm photo first.
          </h1>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#09090f] transition hover:bg-white/90"
          >
            Go to Upload
          </Link>
        </div>
      </main>
    );
  }

  const title =
    storedResult.mode === "compatibility"
      ? "Your Compatibility Preview"
      : "Your Palm Reading Preview";
  const singleCheckoutUrl = process.env.NEXT_PUBLIC_LEMON_SINGLE_CHECKOUT_URL ?? "";
  const compatibilityCheckoutUrl =
    process.env.NEXT_PUBLIC_LEMON_COMPATIBILITY_CHECKOUT_URL ?? "";
  const checkoutUrl =
    storedResult.mode === "compatibility"
      ? compatibilityCheckoutUrl
      : singleCheckoutUrl;
  const hasCheckoutUrl = checkoutUrl.trim().length > 0;
  const isPaid = paidStatus === "paid";
  const activeReportId = resolveReportIdFromClient();

  const handleCheckout = () => {
    if (!hasCheckoutUrl || isPaid || paidStatus === "loading" || !activeReportId) return;

    const rawReport =
      sessionStorage.getItem("palmvibe_report") ??
      localStorage.getItem("palmvibe_report");
    if (rawReport) {
      sessionStorage.setItem("palmvibe_report", rawReport);
      localStorage.setItem("palmvibe_report", rawReport);
    }
    sessionStorage.setItem("palmvibe_mode", storedResult.mode);
    localStorage.setItem("palmvibe_mode", storedResult.mode);

    sessionStorage.setItem("palmvibe_report_id", activeReportId);
    localStorage.setItem("palmvibe_report_id", activeReportId);

    const url = new URL(checkoutUrl.trim());
    url.searchParams.set("checkout[custom][report_id]", activeReportId);
    window.location.href = url.toString();
  };

  const primaryCtaLabel = isPaid
    ? "Report unlocked"
    : paidStatus === "loading"
      ? "Checking payment…"
      : !hasCheckoutUrl
        ? "Payment link not configured"
        : storedResult.mode === "compatibility"
          ? "Unlock Full Compatibility Report — $4.99"
          : "Unlock Full Palm Report — $2.99";

  const ctaDisabled =
    paidStatus === "loading" ||
    isPaid ||
    !hasCheckoutUrl ||
    activeReportId === null;

  const badgeText =
    storedResult.mode === "compatibility"
      ? "AI Compatibility Preview"
      : "AI Palm Reading Preview";
  const vibe =
    storedResult.mode === "compatibility"
      ? storedResult.report.relationship_vibe
      : storedResult.report.palm_vibe;
  const score =
    storedResult.mode === "compatibility"
      ? storedResult.report.compatibility_score
      : null;
  const summary = storedResult.report.one_sentence_summary;
  const insights = storedResult.report.free_preview;
  const fullReportKeys = Object.keys(storedResult.report.full_report);
  const scoreLabel =
    score !== null
      ? score >= 80
        ? "Strong but not effortless"
        : score >= 65
          ? "Workable with emotional awareness"
          : "Mixed rhythm, needs clarity"
      : null;
  const lockedTitle =
    storedResult.mode === "compatibility"
      ? "Unlock your full compatibility report"
      : "Unlock your full palm report";
  const checklist =
    storedResult.mode === "compatibility"
      ? [
          "Person A emotional profile",
          "Person B emotional profile",
          "Attraction pattern",
          "Communication dynamic",
          "Conflict risk",
          "Stability risk",
          "Long-term potential",
          "Practical advice for both people",
        ]
      : [
          "Hand shape analysis",
          "Love style breakdown",
          "Emotional pattern",
          "Career energy",
          "Strengths and risks",
          "Practical advice",
          "Shareable summary card",
        ];
  const insightLabels =
    storedResult.mode === "compatibility"
      ? ["Emotional rhythm", "Hidden tension", "What could make it work"]
      : ["Core pattern", "Love style", "Hidden risk"];

  return (
    <main className="min-h-screen bg-[#09090f] px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 sm:max-w-xl">
        <header className="space-y-2">
          <div className="inline-flex w-fit rounded-full border border-violet-300/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
            {badgeText}
          </div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {paidStatus === "loading" ? (
            <p className="text-center text-sm text-zinc-400">
              Verifying unlock status…
            </p>
          ) : null}
        </header>

        {score !== null ? (
          <section className="rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-violet-200/90">
              Compatibility Score
            </p>
            <p className="mt-2 text-5xl font-bold leading-none text-white">{score}</p>
            <p className="mt-2 text-sm text-zinc-200">{scoreLabel}</p>
            <p className="mt-1 text-sm font-medium text-violet-100">{vibe}</p>
          </section>
        ) : (
          <section className="rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-violet-200/90">Palm Archetype</p>
            <p className="mt-2 text-3xl font-semibold text-white">{vibe}</p>
          </section>
        )}

        {summary ? (
          <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-sm text-zinc-200">"{summary}"</p>
          </section>
        ) : null}

        {insights.length > 0 ? (
          <section className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              3 Preview Insights
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              {insights.map((item, index) => (
                <li
                  key={item}
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"
                >
                  <p className="text-xs font-medium text-violet-200">
                    {insightLabels[index] ?? `Insight ${index + 1}`}
                  </p>
                  <p className="mt-1 text-sm text-zinc-200">{item}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleCheckout}
            disabled={ctaDisabled}
            className="w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {primaryCtaLabel}
          </button>
          {!isPaid && paidStatus !== "loading" ? (
            <p className="text-center text-xs text-zinc-400">
              One-time payment. No subscription.
            </p>
          ) : null}
        </div>

        <section className="rounded-2xl border border-dashed border-violet-300/30 bg-black/25 p-4">
          {isPaid ? (
            <>
              <h2 className="text-base font-semibold text-zinc-100">Your full report</h2>
              <div className="mt-4">
                <FullReportSections fullReport={storedResult.report.full_report} />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-base font-semibold text-zinc-100">{lockedTitle}</h2>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                {checklist.map((item) => (
                  <li key={item} className="rounded-lg bg-white/5 px-3 py-2">
                    ✓ {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2 select-none blur-[3px]">
                {(fullReportKeys.length > 0 ? fullReportKeys : ["final_summary", "advice"])
                  .slice(0, 4)
                  .map((key) => (
                    <p key={key} className="rounded bg-white/10 px-3 py-2 text-sm">
                      {toLabel(key)}: Hidden in full report.
                    </p>
                  ))}
              </div>
            </>
          )}
        </section>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={ctaDisabled}
          className="w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {primaryCtaLabel}
        </button>

        {!isPaid && paidStatus !== "loading" ? (
          <p className="text-center text-xs text-zinc-400">
            One-time payment. No subscription.
          </p>
        ) : null}

        <Link
          href="/upload"
          className="text-center text-sm text-zinc-300 underline underline-offset-4 hover:text-white"
        >
          Back to Upload
        </Link>
      </div>
    </main>
  );
}

const ResultPage = dynamic(async () => ResultPageContent, {
  ssr: false,
});

export default ResultPage;
