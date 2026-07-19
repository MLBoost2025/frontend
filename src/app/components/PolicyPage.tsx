import Link from "next/link";
import BrandMark from "./BrandMark";
import { LEGAL_EFFECTIVE_DATE, SUPPORT_EMAIL } from "@/lib/legal";

export default function PolicyPage({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f7fb] text-zinc-900 dark:bg-[#080812] dark:text-zinc-100">
      <header className="border-b border-black/[0.06] bg-white/80 px-5 py-4 backdrop-blur dark:border-white/[0.07] dark:bg-black/30">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" aria-label="Katalume home"><BrandMark /></Link>
          <Link href="/contact" className="text-sm font-semibold text-brand-600 dark:text-brand-300">Contact</Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
        <p className="eyebrow">Katalume policies</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">{summary}</p>
        <p className="mt-3 text-xs text-zinc-500">Effective {LEGAL_EFFECTIVE_DATE}</p>
        <article className="mt-10 space-y-8 text-sm leading-7 text-zinc-700 dark:text-zinc-300 [&_a]:font-semibold [&_a]:text-brand-600 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-zinc-950 dark:[&_h2]:text-white [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </article>
      </main>
      <footer className="border-t border-black/[0.06] px-5 py-8 text-xs text-zinc-500 dark:border-white/[0.07]">
        <nav className="mx-auto flex max-w-4xl flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refunds">Refunds</Link>
          <Link href="/billing-terms">Billing terms</Link>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </nav>
      </footer>
    </div>
  );
}
