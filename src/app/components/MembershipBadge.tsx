"use client";

import Link from "next/link";
import { Crown, Gem, Sparkles } from "lucide-react";
import { useBilling } from "@/context/BillingContext";

export default function MembershipBadge({ compact = false }: { compact?: boolean }) {
  const { tier, isLoading } = useBilling();
  if (isLoading) return null;

  if (tier === "lumus") {
    return (
      <Link
        href="/billing"
        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-cyan-300 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-950 shadow-sm"
      >
        <Gem className="h-3 w-3" />
        {compact ? "Lumus" : "Lumus Lifetime"}
      </Link>
    );
  }
  if (tier === "plus") {
    return (
      <Link
        href="/billing"
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-600 ring-1 ring-inset ring-brand-500/20 dark:text-brand-300"
      >
        <Crown className="h-3 w-3" />
        Katalume Plus
      </Link>
    );
  }
  return (
    <Link
      href="/pricing"
      className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-600 transition hover:bg-brand-500/10 hover:text-brand-600 dark:bg-white/[0.06] dark:text-zinc-300"
    >
      <Sparkles className="h-3 w-3" />
      {compact ? "Upgrade" : "Free · Upgrade"}
    </Link>
  );
}
