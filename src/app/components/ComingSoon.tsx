"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

interface ComingSoonProps {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  highlight: string;
  description: string;
  features: Feature[];
  note?: string;
}

export default function ComingSoon({
  icon: Icon,
  eyebrow = "Coming soon",
  title,
  highlight,
  description,
  features,
  note = "Launching soon — the practice arena is live today.",
}: ComingSoonProps) {
  return (
    <div className="relative flex min-h-[68vh] flex-col items-center justify-center overflow-hidden px-4 py-10 text-center">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-8 mx-auto h-72 max-w-2xl rounded-full bg-brand-500/15 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/[0.07] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
          </span>
          {eyebrow}
        </span>

        <span className="mt-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/25">
          <Icon className="h-7 w-7" />
        </span>

        <h1 className="mt-6 max-w-2xl font-display text-3xl font-bold leading-[1.12] tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          {title} <span className="text-gradient-brand">{highlight}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </p>

        <div className="mt-9 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          {features.map((feature) => {
            const FeatureIcon = feature.icon;
            return (
              <div key={feature.title} className="card p-4 text-left">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  <FeatureIcon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {feature.body}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-9 flex flex-col items-center gap-3">
          <Link href="/problems" className="btn-primary px-5 py-2.5 text-[15px]">
            Start solving now <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
            <Sparkles className="h-3.5 w-3.5" /> {note}
          </span>
        </div>
      </div>
    </div>
  );
}
