"use client";

import type { LucideIcon } from "lucide-react";

type Accent = "brand" | "accent" | "emerald" | "violet";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  accent?: Accent;
}

const ACCENTS: Record<Accent, string> = {
  brand: "bg-brand-500/10 text-brand-500",
  accent: "bg-accent-500/10 text-accent-500",
  emerald: "bg-emerald-500/10 text-emerald-500",
  violet: "bg-violet-500/10 text-violet-500",
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  hint,
  accent = "brand",
}: StatsCardProps) {
  return (
    <article className="card card-hover p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{title}</p>
        {Icon ? (
          <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${ACCENTS[accent]}`}>
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-[26px] font-bold leading-none tracking-tight text-zinc-900 dark:text-white">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </article>
  );
}
