"use client";

import Link from "next/link";
import { Crown, Gem, Sparkles } from "lucide-react";
import { useBilling } from "@/context/BillingContext";

export default function PremiumPanel({ surface }: { surface: "progress" | "profile" }) {
  const { tier, isPremium } = useBilling();
  const title = surface === "progress" ? "Momentum intelligence" : "Mastery identity";

  if (!isPremium) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-r from-brand-500/[0.08] via-white to-cyan-400/[0.08] p-5 dark:via-[#0a091e]">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Plus preview</p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-950 dark:text-white">{title}, unlocked.</h2>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
              Upgrade for the premium mastery layer, every problem, and interview tracks.
            </p>
          </div>
          <Link href="/pricing" className="btn-primary w-fit">Explore Plus</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#08071a] p-6 text-white shadow-2xl shadow-brand-950/20 ring-1 ring-white/10">
      <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="absolute -bottom-20 left-1/3 h-40 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
            {tier === "lumus" ? <Gem className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
            {tier === "lumus" ? "Lumus intelligence" : "Plus intelligence"}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">
            Your full catalog signal is active. Every solve now contributes to your premium mastery view.
          </p>
        </div>
        <Link href="/billing" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-white/15 transition hover:bg-white/15">
          Manage membership
        </Link>
      </div>
    </section>
  );
}
