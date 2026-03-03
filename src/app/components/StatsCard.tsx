"use client";

interface StatsCardProps {
  title: string;
  value: string | number;
}

export default function StatsCard({ title, value }: StatsCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white/90 p-5 backdrop-blur transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-700">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </article>
  );
}
