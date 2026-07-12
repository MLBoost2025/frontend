"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Github,
  Play,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
} from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

const FEATURES = [
  {
    icon: Terminal,
    title: "In-browser judge",
    body: "Write Python in a real editor and get instant, test-case-level feedback on every run and submit.",
    accent: "text-brand-500 bg-brand-500/10",
  },
  {
    icon: Trophy,
    title: "Contests & leaderboards",
    body: "Timed ML competitions with live standings — climb the global ranks as you solve.",
    accent: "text-amber-500 bg-amber-500/10",
  },
  {
    icon: BookOpen,
    title: "Guided learn tracks",
    body: "Curated paths that map directly to hands-on problems, from foundations to model selection.",
    accent: "text-accent-500 bg-accent-500/10",
  },
  {
    icon: BarChart3,
    title: "Progress that's real",
    body: "Streaks, acceptance trends, and per-topic coverage computed from your own submissions.",
    accent: "text-violet-500 bg-violet-500/10",
  },
];

const STATS = [
  { value: "ML-first", label: "Problems built for data science, not generic DSA" },
  { value: "Instant", label: "Test-case-level judging on every submit" },
  { value: "Open", label: "Practice free — no premium wall" },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen">
      <a
        href="#landing-main"
        className="sr-only fixed left-4 top-4 z-50 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
      >
        Skip to main content
      </a>
      {/* Top nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-[13px] font-black text-white shadow-[0_4px_14px_-4px_rgba(244,102,31,0.6)]">
            ML
            <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-zinc-900 dark:text-white">
            MLBoost
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher compact />
          <Link
            href="/login"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            Sign in
          </Link>
          <Link href="/login" className="btn-primary px-4 py-1.5 text-sm">
            Get started
          </Link>
        </div>
      </header>

      <main id="landing-main">
      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-10 pt-10 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-brand-400">
            <Sparkles className="h-3.5 w-3.5" /> LeetCode × Kaggle, for ML
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-zinc-900 dark:text-white sm:text-5xl md:text-6xl">
            Practice machine learning like you{" "}
            <span className="text-gradient-brand">mean it.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Interview-grade ML &amp; data-science problems with an in-browser judge,
            timed contests, guided tracks, and progress computed from your real
            submissions.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className="btn-primary px-5 py-2.5 text-[15px]">
              Start solving free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] px-5 py-2.5 text-[15px] font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-white/[0.1] dark:text-zinc-200 dark:hover:bg-white/[0.05]"
            >
              <Play className="h-4 w-4" /> See a problem
            </Link>
          </div>
        </div>

        {/* Product visual — a stylized arena preview */}
        <div className="relative mx-auto mt-14 max-w-4xl">
          <div className="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[40px] bg-gradient-to-b from-brand-500/10 to-transparent blur-2xl" />
          <div className="card overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-black/[0.05] px-4 py-2.5 dark:border-white/[0.06]">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-3 font-mono text-xs text-zinc-400">knn-classifier-iris · main.py</span>
            </div>
            <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
              <pre className="overflow-x-auto border-b border-black/[0.05] p-5 font-mono text-[12.5px] leading-6 text-zinc-600 dark:border-white/[0.06] dark:text-zinc-300 sm:border-b-0 sm:border-r">
{`def fit_and_predict(X, y, T, k):
    preds = []
    for t in T:
        d = sorted(
          (dist(t, x), y[i])
          for i, x in enumerate(X))
        top = [lbl for _, lbl in d[:k]]
        preds.append(vote(top))
    return preds`}
              </pre>
              <div className="space-y-3 p-5">
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/[0.08] px-3.5 py-2.5 text-sm font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" /> Accepted · 6/6 hidden tests
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {["Runtime 114ms", "Memory 28MB", "Easy"].map((m) => (
                    <span
                      key={m}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-500 dark:bg-white/[0.05] dark:text-zinc-400"
                    >
                      {m}
                    </span>
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Every submit is judged against hidden test cases with runtime &
                  memory — just like a real interview.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-5 py-8 sm:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.value} className="card card-hover p-5 text-center">
            <p className="text-2xl font-bold tracking-tight text-gradient-brand">{s.value}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-5 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Everything you need to get ML-interview ready
          </h2>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            One focused platform — solve, compete, learn, and track. No fluff.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <article key={f.title} className="card card-hover p-6">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${f.accent}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-zinc-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {f.body}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0e13] px-8 py-12 text-center text-white">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(600px 300px at 80% -30%, rgba(244,102,31,0.35), transparent 60%), radial-gradient(500px 260px at 15% 130%, rgba(14,165,233,0.22), transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to sharpen your ML edge?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
              Create an account and solve your first problem in under a minute.
            </p>
            <Link href="/login" className="btn-primary mt-6 px-6 py-2.5 text-[15px]">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 border-t border-black/[0.05] px-5 py-6 text-xs text-zinc-400 dark:border-white/[0.06] sm:flex-row">
        <span>© {`${new Date().getFullYear()}`} MLBoost — practice ML, the right way.</span>
        <a
          href="https://github.com/MLBoost2025"
          className="inline-flex items-center gap-1.5 transition hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <Github className="h-3.5 w-3.5" /> MLBoost2025
        </a>
      </footer>
    </div>
  );
}
