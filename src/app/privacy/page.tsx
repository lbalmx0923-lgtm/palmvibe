import type { Metadata } from "next";
import { LegalPageLayout } from "../components/legal-page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy | PalmVibe",
  description: "How PalmVibe handles your palm images, AI analysis, and browser storage.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p className="text-zinc-200">
        Last updated: May 1, 2026. PalmVibe (&quot;we&quot;, &quot;us&quot;) respects your
        privacy. This policy explains what we do with information when you use our website and
        services.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">What PalmVibe Does</h2>
        <p>
          PalmVibe lets you upload palm images to generate AI-powered reports for{" "}
          <strong className="font-medium text-zinc-200">entertainment and self-reflection</strong>{" "}
          only. Our outputs are not intended as professional or scientific assessments of you or
          your relationships.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Images and AI Analysis</h2>
        <p>
          When you choose to generate a reading, your uploaded images may be sent to third-party
          AI service providers (for example, model providers) to produce the text you see. How long
          those providers retain data is governed by their policies; we design PalmVibe to focus on
          generating your report and not on building a long-term image archive on our side beyond
          what is needed to operate the service.
        </p>
        <p>
          Do not upload images you do not have the right to use, or images of others without their
          consent where required by law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Local Storage and Payment Unlocks</h2>
        <p>
          Generated reports and related settings may be stored in your browser using{" "}
          <strong className="font-medium text-zinc-200">local storage</strong> and/or{" "}
          <strong className="font-medium text-zinc-200">session storage</strong> so you can view
          previews and return to your reading without always creating an account.
        </p>
        <p>
          To unlock paid full reports, payment status is verified on our servers (for example, via
          a payment provider webhook and a short-lived server-side record). Your browser storage
          holds report content and identifiers for convenience; it is{" "}
          <strong className="font-medium text-zinc-200">not</strong> the source of truth for
          whether you have paid—that is determined by our backend checks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Payments</h2>
        <p>
          Payments are processed by{" "}
          <strong className="font-medium text-zinc-200">Lemon Squeezy</strong>, our merchant of
          record. When you pay, Lemon Squeezy may collect billing and transaction data needed to
          complete the purchase. We do not store your full card details on PalmVibe servers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Important Disclaimer</h2>
        <p>
          PalmVibe does <strong className="font-medium text-zinc-200">not</strong> provide medical,
          psychological, legal, financial, scientific, or professional relationship advice. If you
          need help in those areas, consult a qualified professional.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Contact</h2>
        <p>
          Questions about this policy:{" "}
          <a
            href="mailto:support@palmvibe.com"
            className="font-medium text-violet-300 underline decoration-violet-500/40 underline-offset-2 hover:text-violet-200"
          >
            support@palmvibe.com
          </a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
