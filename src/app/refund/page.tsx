import type { Metadata } from "next";
import { LegalPageLayout } from "../components/legal-page-layout";

export const metadata: Metadata = {
  title: "Refund Policy | PalmVibe",
  description: "How PalmVibe handles refunds for digital AI-generated palm reports.",
};

export default function RefundPage() {
  return (
    <LegalPageLayout title="Refund Policy">
      <p className="text-zinc-200">
        Last updated: May 1, 2026. This policy describes how refunds work for PalmVibe digital
        products sold through Lemon Squeezy.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Digital Delivery</h2>
        <p>
          PalmVibe sells <strong className="font-medium text-zinc-200">digital AI-generated reports</strong>
          . After a successful payment, access to paid content may be unlocked or delivered
          digitally without a physical shipment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Purchases Are Generally Final</h2>
        <p>
          Because reports are generated on demand and delivered digitally,{" "}
          <strong className="font-medium text-zinc-200">purchases are generally non-refundable</strong>{" "}
          once unlocked or fulfilled, except as described below or where required by law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">When Refunds May Be Considered</h2>
        <p>
          We may consider refunds or corrections in situations such as: duplicate payments for the
          same transaction, inability to access a purchased report after payment due to a clear
          technical issue on our side, or demonstrable billing errors.
        </p>
        <p>
          Approval is not guaranteed; each request is reviewed in good faith. Chargebacks create
          additional costs—we encourage you to contact us first when something goes wrong.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">How to Request Help</h2>
        <p>
          Email{" "}
          <a
            href="mailto:support@palmvibe.com"
            className="font-medium text-violet-300 underline decoration-violet-500/40 underline-offset-2 hover:text-violet-200"
          >
            support@palmvibe.com
          </a>{" "}
          with your order details (email used at checkout), approximate time of purchase, and a
          short description of the issue.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Lemon Squeezy Processing</h2>
        <p>
          Payments are handled by Lemon Squeezy. Where refunds are granted, processing timelines
          and mechanics may depend on Lemon Squeezy and your payment method issuer.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Contact</h2>
        <p>
          Billing and access support:{" "}
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
