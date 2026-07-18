"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import MainLayout from "@/app/components/MainLayout";
import { useBilling } from "@/context/BillingContext";

export default function BillingReturnPage() {
  const { tier, refresh } = useBilling();
  const [checks, setChecks] = useState(0);

  useEffect(() => {
    if (tier !== "free" || checks >= 12) return;
    const timer = window.setTimeout(async () => {
      await refresh();
      setChecks((value) => value + 1);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [tier, checks, refresh]);

  const active = tier === "plus" || tier === "lumus";
  return (
    <MainLayout title="Membership verification" subtitle="The provider redirect never grants access">
      <section className="card mx-auto max-w-2xl p-8 text-center">
        {active ? (
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        ) : (
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-500" />
        )}
        <h2 className="mt-5 text-2xl font-semibold text-zinc-950 dark:text-white">
          {active ? `${tier === "lumus" ? "Lumus" : "Plus"} is active` : "Verifying your payment"}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {active
            ? "A signed Cashfree webhook reached Katalume and your entitlement is verified."
            : checks >= 12
            ? "The provider is still processing the payment. No access decision is made from this page; check Membership shortly."
            : "This usually takes a few seconds. You can safely leave this page—verification continues server-side."}
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link href="/billing" className="btn-primary">View membership</Link>
          <Link href="/problems" className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold dark:border-white/10">Back to problems</Link>
        </div>
      </section>
    </MainLayout>
  );
}
