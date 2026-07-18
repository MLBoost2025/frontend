"use client";

import { BadgeCheck, BriefcaseBusiness, Target } from "lucide-react";
import MainLayout from "../components/MainLayout";
import ComingSoon from "../components/ComingSoon";
import Link from "next/link";
import { LockKeyhole, Sparkles } from "lucide-react";
import { useBilling } from "@/context/BillingContext";

export default function TracksPage() {
  const { isPremium, summary, isLoading } = useBilling();
  const enforced = summary?.configuration.enforcementEnabled;

  if (!isLoading && enforced && !isPremium) {
    return (
      <MainLayout title="Interview Tracks" subtitle="A Katalume Plus experience">
        <section className="relative overflow-hidden rounded-3xl bg-[#08071a] px-6 py-14 text-center text-white ring-1 ring-white/10 sm:px-12">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/15">
              <LockKeyhole className="h-5 w-5 text-cyan-200" />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Plus exclusive</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Interview preparation, illuminated.</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/65 sm:text-base">
              Curated role paths and company-style sequences are reserved for Plus and Lumus members.
            </p>
            <Link href="/pricing" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-zinc-950">
              <Sparkles className="h-4 w-4" /> Unlock with Plus
            </Link>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Interview Tracks" subtitle="Role-ready ML interview prep">
      <ComingSoon
        icon={BriefcaseBusiness}
        title="Land your ML role with"
        highlight="curated tracks."
        description="Company-style prep paths that bundle the exact problems and skills top machine-learning and data-science interviews demand."
        features={[
          {
            icon: BriefcaseBusiness,
            title: "Role-ready paths",
            body: "Focused sequences that mirror real ML interview loops.",
          },
          {
            icon: Target,
            title: "Company style",
            body: "Practice the patterns top labs and startups actually ask.",
          },
          {
            icon: BadgeCheck,
            title: "Interview-ready",
            body: "Finish a track knowing you can walk in prepared.",
          },
        ]}
        note="Launching soon — build your edge in the arena today."
      />
    </MainLayout>
  );
}
