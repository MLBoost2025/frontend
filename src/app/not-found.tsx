import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-6 text-center dark:bg-zinc-950">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        This page does not exist
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        The route may have moved or is unavailable.
      </p>
      <Link
        href="/problems"
        className="mt-5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Go to Problems
      </Link>
    </main>
  );
}
