import type { Metadata } from "next";
import PolicyPage from "../components/PolicyPage";
import { SUPPORT_EMAIL } from "@/lib/legal";

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy notice" summary="This notice explains what Katalume collects, why it is used, and the choices available to you.">
      <section><h2>Information we collect</h2><ul><li>Account details such as name, email, avatar, sign-in provider, and security session data.</li><li>Learning activity such as code submissions, verdicts, quiz progress, solved problems, and contest activity.</li><li>Operational data such as IP address, device/browser signals, request identifiers, logs, and security events.</li><li>Billing contact details, membership state, provider references, and payment receipts. Card, UPI PIN, CVV, and bank credentials stay with the payment provider.</li></ul></section>
      <section><h2>How we use it</h2><p>We use information to authenticate you, operate the judge, maintain progress, provide support, prevent abuse, fulfill verified purchases, reconcile billing, and improve reliability. We do not sell personal information.</p></section>
      <section><h2>Service providers</h2><p>We use infrastructure, database, authentication, monitoring, and—when enabled—payment providers to operate Katalume. They process limited data under their own security and privacy obligations.</p></section>
      <section><h2>Retention and security</h2><p>We retain data while your account is active and as needed for security, legal, tax, dispute, and operational obligations. We use access controls, encryption in transit, restricted secrets, signed webhooks, and audit logs, but no system can guarantee absolute security.</p></section>
      <section><h2>Your choices</h2><p>You can export or delete your account from account controls. Some billing and audit records may be retained or de-identified where law or legitimate fraud-prevention needs require it. Ask for access, correction, or help at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p></section>
      <section><h2>Children and changes</h2><p>Katalume is not directed to children below the age permitted to independently consent to online services in their location. Material notice changes will receive a revised effective date.</p></section>
    </PolicyPage>
  );
}
export const metadata: Metadata = { title: "Privacy notice", description: "How Katalume collects, uses, secures, and retains information." };
