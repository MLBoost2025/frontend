import type { Metadata } from "next";
import PolicyPage from "../components/PolicyPage";
import { LEGAL_ENTITY_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export default function ContactPage() {
  return (
    <PolicyPage title="Contact Katalume" summary="Account, learning, security, privacy, and billing support in one place.">
      <section><h2>Support</h2><p>Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Include your account email, a short description, and a request ID if an error displayed one.</p></section>
      <section><h2>Billing safety</h2><p>For payment issues, include only the provider payment reference shown on your receipt. Never send card numbers, CVV, UPI PIN, bank passwords, OTPs, OAuth secrets, or API keys.</p></section>
      <section><h2>Operator</h2><p>The service is operated under the Katalume name by {LEGAL_ENTITY_NAME}. Formal business address, tax registration, and grievance-contact details will be published here before live payments are enabled.</p></section>
    </PolicyPage>
  );
}
export const metadata: Metadata = { title: "Contact", description: "Contact Katalume for account, learning, privacy, security, or billing support." };
