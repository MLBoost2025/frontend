import type { Metadata } from "next";
import PolicyPage from "../components/PolicyPage";
import { SUPPORT_EMAIL } from "@/lib/legal";

export default function RefundsPage() {
  return (
    <PolicyPage title="Cancellation and refund policy" summary="Clear rules for recurring memberships, Lumus lifetime access, duplicate charges, and failed payments.">
      <section><h2>Recurring memberships</h2><p>You may cancel renewal from Membership at any time. Cancellation stops future renewals; verified access normally continues through the already-paid period. Partial periods are not automatically prorated.</p></section>
      <section><h2>Refund requests</h2><p>If a payment was duplicated, charged after a confirmed cancellation, or access was not delivered because of our technical error, contact us within 7 days of the charge. Include your account email and payment reference, but never send card details, CVV, UPI PIN, passwords, or OTPs.</p></section>
      <section><h2>Lumus lifetime access</h2><p>Lumus is a one-time purchase for access during the commercial lifetime of the Katalume product, not the purchaser’s lifetime. A verified full refund revokes the corresponding Lumus entitlement.</p></section>
      <section><h2>Processing</h2><p>Approved refunds are returned through the original payment route. Banks and payment networks control final settlement time. We may refuse requests involving policy abuse, consumed contest benefits, fraud, or circumstances outside applicable consumer-law requirements.</p></section>
      <section><h2>Contact</h2><p>Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. This policy does not limit rights that cannot be waived under applicable law.</p></section>
    </PolicyPage>
  );
}
export const metadata: Metadata = { title: "Refund policy", description: "Katalume cancellation and refund rules." };
