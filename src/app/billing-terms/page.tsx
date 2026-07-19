import type { Metadata } from "next";
import PolicyPage from "../components/PolicyPage";
import { SUPPORT_EMAIL } from "@/lib/legal";

export default function BillingTermsPage() {
  return (
    <PolicyPage title="Billing terms" summary="How Katalume prices, renews, verifies, cancels, and records paid memberships.">
      <section><h2>Prices and authorization</h2><p>Prices are shown in Indian rupees before checkout. Taxes, where applicable, are disclosed or included as required. Your payment provider may perform an authorization step before the first recurring charge.</p></section>
      <section><h2>Recurring Plus plans</h2><p>Weekly, monthly, and yearly Plus plans renew at the displayed cadence until cancelled. By confirming checkout, you authorize recurring charges for the selected amount and cadence. If pricing changes, the new price will apply only after notice and any consent required by law or the payment mandate.</p></section>
      <section><h2>Lumus</h2><p>Lumus is a one-time, non-renewing purchase that unlocks the benefits shown at purchase for the commercial lifetime of Katalume. It does not guarantee that every feature will exist forever or remain unchanged.</p></section>
      <section><h2>Verification and access</h2><p>A redirect or screenshot is not proof of payment. Katalume changes access only after a verified provider event. Failed, reversed, refunded, fraudulent, or disputed payments may delay, suspend, or revoke the related entitlement.</p></section>
      <section><h2>Receipts, invoices, and support</h2><p>Your account may show payment receipts and provider references. A payment receipt is not a GST tax invoice unless explicitly labelled as one. For billing support or an applicable tax document, contact <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p></section>
    </PolicyPage>
  );
}
export const metadata: Metadata = { title: "Billing terms", description: "Katalume membership prices, renewals, verification, and receipts." };
