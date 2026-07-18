"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Crown, Gem, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import MainLayout from "../components/MainLayout";
import { createBillingCheckout, fetchBillingOffers } from "@/lib/api";
import { openCashfreeCheckout } from "@/lib/cashfree";
import { BillingOffer, BillingOffersResponse } from "@/types";
import { useBilling } from "@/context/BillingContext";

function money(minor: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

const cadenceCopy = {
  weekly: "every week",
  monthly: "every month",
  yearly: "every year",
  lifetime: "once",
};

export default function PricingPage() {
  const { tier } = useBilling();
  const [catalog, setCatalog] = useState<BillingOffersResponse | null>(null);
  const [selected, setSelected] = useState<BillingOffer | null>(null);
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "opening" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetchBillingOffers().then(setCatalog).catch(() => {
      setMessage("Plans could not be loaded. Please try again shortly.");
      setState("error");
    });
  }, []);

  const benefits = useMemo(() => [
    `All current and future problems — ${catalog?.freeProblemCount || 60} remain free`,
    "Plus-only interview tracks",
    "Premium Progress intelligence",
    "Premium Profile identity and insights",
  ], [catalog]);

  async function beginCheckout(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    if (!catalog?.configuration.checkoutEnabled) {
      setState("error");
      setMessage("Secure checkout is staged but not active yet. No charge was made.");
      return;
    }
    try {
      setState("opening");
      setMessage("");
      const checkout = await createBillingCheckout(selected.offerKey, phone);
      await openCashfreeCheckout(checkout);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Checkout could not be opened. No charge was made.");
    }
  }

  return (
    <MainLayout title="Membership" subtitle="Choose the pace that carries you to mastery">
      <section className="relative overflow-hidden rounded-3xl bg-[#08071a] px-6 py-12 text-center text-white ring-1 ring-white/10 sm:px-12">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">Katalume membership</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Practice without a ceiling.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">
            Start with 60 carefully balanced problems for free. Plus unlocks the complete arena;
            Lumus keeps it unlocked for the lifetime of the product.
          </p>
          {tier !== "free" ? (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-white/15">
              <Crown className="h-4 w-4 text-cyan-200" /> Your {tier === "lumus" ? "Lumus" : "Plus"} access is active
            </p>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(catalog?.offers || []).map((offer) => (
          <article
            key={offer.offerKey}
            className={`relative flex flex-col rounded-3xl border p-5 ${
              offer.tier === "lumus"
                ? "border-amber-300/40 bg-gradient-to-b from-amber-100/80 to-white dark:from-amber-300/[0.10] dark:to-zinc-950"
                : offer.popular
                ? "border-brand-500/40 bg-brand-500/[0.06]"
                : "border-black/[0.07] bg-white/90 dark:border-white/[0.07] dark:bg-zinc-900/80"
            }`}
          >
            {offer.popular ? (
              <span className="absolute right-4 top-4 rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Most popular</span>
            ) : null}
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              {offer.tier === "lumus" ? <Gem className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-zinc-950 dark:text-white">{offer.name}</h3>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">{money(offer.amountMinor)}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{cadenceCopy[offer.cadence]}</p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex gap-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {benefit}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => { setSelected(offer); setState("idle"); setMessage(""); }}
              disabled={tier === "lumus"}
              className="mt-6 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950"
            >
              {tier === "lumus" ? "Already unlocked" : catalog?.configuration.checkoutEnabled ? "Choose plan" : "Preview plan"}
            </button>
          </article>
        ))}
      </section>

      {selected ? (
        <section className="card p-5 sm:p-6" aria-labelledby="checkout-heading">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Secure checkout</p>
              <h2 id="checkout-heading" className="mt-2 text-xl font-semibold text-zinc-950 dark:text-white">
                Continue with {selected.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {money(selected.amountMinor)} {cadenceCopy[selected.cadence]}. Payment details stay with Cashfree.
              </p>
            </div>
            <form onSubmit={beginCheckout} className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Indian mobile number</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="10-digit Indian mobile"
                  pattern="[6-9][0-9]{9}"
                  required
                  className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-white/10 dark:bg-white/[0.05]"
                />
              </label>
              <button type="submit" disabled={state === "opening"} className="btn-primary justify-center disabled:opacity-50">
                {state === "opening" ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening…</> : "Continue securely"}
              </button>
            </form>
          </div>
          {message ? <p role="alert" className="mt-4 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">{message}</p> : null}
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          [ShieldCheck, "Webhook verified", "Access changes only after a signed server event."],
          [Sparkles, "No card storage", "Katalume never receives PAN, CVV, UPI PIN, or bank credentials."],
          [Gem, "Provider-portable", "Your entitlement ledger stays independent from the payment provider."],
        ].map(([Icon, title, copy]) => {
          const ItemIcon = Icon as typeof ShieldCheck;
          return (
            <article key={String(title)} className="rounded-2xl border border-black/[0.06] bg-white/70 p-4 dark:border-white/[0.06] dark:bg-white/[0.025]">
              <ItemIcon className="h-4 w-4 text-brand-500" />
              <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">{String(title)}</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{String(copy)}</p>
            </article>
          );
        })}
      </section>
    </MainLayout>
  );
}
