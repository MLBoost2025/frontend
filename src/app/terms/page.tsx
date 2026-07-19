import type { Metadata } from "next";
import PolicyPage from "../components/PolicyPage";
import { LEGAL_ENTITY_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of use" summary={`These terms govern your use of services operated under the Katalume name by ${LEGAL_ENTITY_NAME}.`}>
      <section><h2>Using the service</h2><p>You must provide accurate account information, keep access credentials secure, and use Katalume only for lawful learning and practice. You are responsible for code and other material you submit.</p></section>
      <section><h2>Acceptable use</h2><ul><li>Do not attack, scrape, overload, reverse engineer, or bypass access controls.</li><li>Do not submit malware, secrets, unlawful material, or code intended to harm systems or people.</li><li>Do not share paid access or use automation to gain an unfair ranking or contest advantage.</li></ul></section>
      <section><h2>Content and code</h2><p>Katalume retains rights in its problem statements, tests, curriculum, brand, and software. You retain ownership of original code you submit and grant us the limited rights needed to run, evaluate, store, and display it to you.</p></section>
      <section><h2>Accounts and availability</h2><p>We may restrict or terminate access for material violations, security risk, fraud, or legal requirements. The service may change and may occasionally be unavailable. We do not promise that every result or learning resource is error-free.</p></section>
      <section><h2>Paid access</h2><p>Paid memberships are also governed by the <a href="/billing-terms">Billing terms</a> and <a href="/refunds">Refund policy</a>. The checkout screen shows the price and cadence before you authorize payment.</p></section>
      <section><h2>Liability</h2><p>To the extent permitted by applicable law, Katalume is provided without warranties and is not responsible for indirect or consequential loss. Nothing here excludes consumer rights or liability that cannot legally be excluded.</p></section>
      <section><h2>Questions</h2><p>Contact <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We may update these terms prospectively and will show a new effective date when we do.</p></section>
    </PolicyPage>
  );
}
export const metadata: Metadata = { title: "Terms of use", description: "Terms governing use of Katalume." };
