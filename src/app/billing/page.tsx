"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, Crown, FileText, Gem, Loader2, ShieldCheck } from "lucide-react";
import MainLayout from "../components/MainLayout";
import { useBilling } from "@/context/BillingContext";
import { cancelBillingSubscription, fetchBillingReceipts } from "@/lib/api";
import { BillingReceipt } from "@/types";

export default function BillingPage() {
  const { summary, tier, isLoading, refresh } = useBilling();
  const [isCancelling, setIsCancelling] = useState(false);
  const [message, setMessage] = useState("");
  const [receipts, setReceipts] = useState<BillingReceipt[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState(true);

  useEffect(() => {
    void fetchBillingReceipts()
      .then((response) => setReceipts(response.receipts))
      .catch(() => setMessage("Payment receipts could not be loaded."))
      .finally(() => setReceiptsLoading(false));
  }, []);

  async function cancel() {
    if (!summary?.subscription) return;
    try {
      setIsCancelling(true);
      setMessage("");
      await cancelBillingSubscription(summary.subscription.id);
      await refresh();
      setMessage("Renewal cancelled. Verified access remains available through the paid period.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cancellation could not be completed.");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <MainLayout title="Membership" subtitle="Your verified access and billing controls">
      <section className="relative overflow-hidden rounded-3xl bg-[#08071a] p-7 text-white ring-1 ring-white/10">
        <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="relative">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
            {tier === "lumus" ? <Gem className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
            Current membership
          </p>
          <h2 className="mt-4 text-3xl font-semibold capitalize">{isLoading ? "Verifying…" : tier}</h2>
          <p className="mt-2 max-w-xl text-sm text-white/65">
            Access is resolved from Katalume&apos;s server-side entitlement ledger, never from a checkout redirect.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Verified access</h2>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-zinc-500">Tier</dt><dd className="font-semibold capitalize">{tier}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-zinc-500">Benefits</dt><dd className="text-right">{summary?.entitlement.benefits.length || 0} active</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-zinc-500">Access until</dt><dd className="text-right">{summary?.entitlement.endsAt ? new Date(summary.entitlement.endsAt).toLocaleDateString("en-IN") : tier === "lumus" ? "Lifetime" : "—"}</dd></div>
          </dl>
          {tier === "free" ? <Link href="/pricing" className="btn-primary mt-6 inline-flex">Explore membership</Link> : null}
        </article>

        <article className="card p-5">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Renewal</h2>
          </div>
          {summary?.subscription ? (
            <>
              <p className="mt-5 text-sm text-zinc-600 dark:text-zinc-300">
                Status: <span className="font-semibold capitalize">{summary.subscription.status.replace("_", " ")}</span>
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {summary.subscription.currentPeriodEnd
                  ? `Current access period ends ${new Date(summary.subscription.currentPeriodEnd).toLocaleDateString("en-IN")}.`
                  : "The first verified charge is still pending."}
              </p>
              {!summary.subscription.cancelAtPeriodEnd ? (
                <button onClick={cancel} disabled={isCancelling} className="mt-6 rounded-full border border-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-600 disabled:opacity-50 dark:text-rose-300">
                  {isCancelling ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Cancelling…</span> : "Cancel renewal"}
                </button>
              ) : <p className="mt-5 text-sm font-medium text-amber-600 dark:text-amber-300">Renewal is cancelled.</p>}
            </>
          ) : (
            <p className="mt-5 text-sm text-zinc-500">No recurring subscription is attached to this account.</p>
          )}
        </article>
      </section>
      <section className="card p-5" aria-labelledby="receipts-heading">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-brand-500" />
          <h2 id="receipts-heading" className="text-sm font-semibold text-zinc-900 dark:text-white">Payment receipts</h2>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          These records confirm verified payments. They are not GST tax invoices unless explicitly labelled otherwise.
        </p>
        {receiptsLoading ? (
          <p className="mt-5 text-sm text-zinc-500">Loading receipts…</p>
        ) : receipts.length === 0 ? (
          <p className="mt-5 text-sm text-zinc-500">No verified payments are attached to this account.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr><th className="pb-3">Date</th><th className="pb-3">Membership</th><th className="pb-3">Reference</th><th className="pb-3">Amount</th><th className="pb-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.07]">
                {receipts.map((receipt) => (
                  <tr key={receipt.id}>
                    <td className="py-3">{new Date(receipt.occurredAt).toLocaleDateString("en-IN")}</td>
                    <td className="py-3 font-medium">{receipt.offerName}</td>
                    <td className="py-3 font-mono text-xs">{receipt.providerPaymentReference}</td>
                    <td className="py-3">{new Intl.NumberFormat("en-IN", { style: "currency", currency: receipt.currency }).format(receipt.amountMinor / 100)}</td>
                    <td className="py-3 capitalize">{receipt.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {message ? <p role="status" className="rounded-xl bg-brand-500/10 px-4 py-3 text-sm text-brand-700 dark:text-brand-200">{message}</p> : null}
    </MainLayout>
  );
}
