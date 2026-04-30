"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

type Mode = "single" | "compatibility";

export default function UploadPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "single";
    return new URLSearchParams(window.location.search).get("mode") ===
      "compatibility"
      ? "compatibility"
      : "single";
  });
  const [singlePalm, setSinglePalm] = useState<File | null>(null);
  const [firstPalm, setFirstPalm] = useState<File | null>(null);
  const [secondPalm, setSecondPalm] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canGenerate = useMemo(() => {
    if (mode === "single") return Boolean(singlePalm);
    return Boolean(firstPalm && secondPalm);
  }, [mode, singlePalm, firstPalm, secondPalm]);

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const onGenerate = async () => {
    if (!canGenerate) return;

    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      const files = mode === "single" ? [singlePalm] : [firstPalm, secondPalm];
      const resolvedFiles = files.filter((file): file is File => Boolean(file));
      const expectedCount = mode === "single" ? 1 : 2;

      if (resolvedFiles.length !== expectedCount) {
        throw new Error(
          mode === "single"
            ? "Single mode requires exactly 1 image."
            : "Compatibility mode requires exactly 2 images."
        );
      }

      const images = await Promise.all(resolvedFiles.map(fileToDataUrl));
      if (images.length !== expectedCount) {
        throw new Error("Image conversion failed. Please re-upload and try again.");
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode, images }),
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: unknown; details?: unknown; raw?: unknown }
        | null;

      if (!response.ok) {
        console.error("Analyze API error:", data);

        const fallbackMessage = "Failed to analyze your palm images. Please try again.";
        const errorMessageFromApi =
          (typeof data?.error === "string" && data.error) ||
          (typeof data?.details === "string" && data.details) ||
          (typeof data?.raw === "string" && data.raw) ||
          fallbackMessage;

        throw new Error(errorMessageFromApi);
      }

      const serializedReport = JSON.stringify(data);
      const reportId = crypto.randomUUID();
      sessionStorage.setItem("palmvibe_report", serializedReport);
      sessionStorage.setItem("palmvibe_mode", mode);
      sessionStorage.setItem("palmvibe_report_id", reportId);
      localStorage.setItem("palmvibe_report", serializedReport);
      localStorage.setItem("palmvibe_mode", mode);
      localStorage.setItem("palmvibe_report_id", reportId);
      router.push(`/result?report_id=${encodeURIComponent(reportId)}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to analyze your palm images. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/20 bg-white/5 px-3 py-3 text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-violet-500 file:px-3 file:py-1 file:text-white file:hover:bg-violet-400";

  return (
    <main className="min-h-screen bg-[#09090f] px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-5 sm:max-w-xl">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Upload Your Palm Photos</h1>
          <p className="text-sm text-zinc-300">
            Choose your reading mode and upload clear palm images.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setMode("single")}
            disabled={isAnalyzing}
            className={clsx(
              "rounded-lg px-3 py-2 text-sm font-medium transition",
              mode === "single"
                ? "bg-violet-500 text-white"
                : "text-zinc-300 hover:bg-white/10",
              isAnalyzing && "cursor-not-allowed opacity-60"
            )}
          >
            Single Reading
          </button>
          <button
            type="button"
            onClick={() => setMode("compatibility")}
            disabled={isAnalyzing}
            className={clsx(
              "rounded-lg px-3 py-2 text-sm font-medium transition",
              mode === "compatibility"
                ? "bg-violet-500 text-white"
                : "text-zinc-300 hover:bg-white/10",
              isAnalyzing && "cursor-not-allowed opacity-60"
            )}
          >
            Love Compatibility
          </button>
        </section>

        {mode === "single" ? (
          <section className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">
              Upload 1 palm image
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              disabled={isAnalyzing}
              onChange={(e) => setSinglePalm(e.target.files?.[0] ?? null)}
              className={inputClass}
            />
            <p className="text-xs text-zinc-400">
              Selected: {singlePalm?.name ?? "No file selected"}
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">
                Upload first palm image
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                disabled={isAnalyzing}
                onChange={(e) => setFirstPalm(e.target.files?.[0] ?? null)}
                className={inputClass}
              />
              <p className="text-xs text-zinc-400">
                Selected: {firstPalm?.name ?? "No file selected"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">
                Upload second palm image
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                disabled={isAnalyzing}
                onChange={(e) => setSecondPalm(e.target.files?.[0] ?? null)}
                className={inputClass}
              />
              <p className="text-xs text-zinc-400">
                Selected: {secondPalm?.name ?? "No file selected"}
              </p>
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || isAnalyzing}
          className={clsx(
            "rounded-xl px-4 py-3 text-sm font-semibold transition",
            canGenerate && !isAnalyzing
              ? "bg-white text-[#09090f] hover:bg-white/90"
              : "cursor-not-allowed bg-white/20 text-zinc-400"
          )}
        >
          {isAnalyzing ? "Analyzing your palm..." : "Generate Free Reading"}
        </button>

        {isAnalyzing ? (
          <p className="text-xs text-zinc-400">
            This usually takes 10-30 seconds.
          </p>
        ) : null}

        {errorMessage ? (
          <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {errorMessage}
          </p>
        ) : null}

        <p className="text-xs leading-5 text-zinc-400">
          PalmVibe is for entertainment and self-reflection only.
        </p>
      </div>
    </main>
  );
}
