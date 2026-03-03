"use client";

export default function ProblemsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-100 px-6 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
      <p className="text-sm text-red-600 dark:text-red-300">
        Failed to load problems: {error.message}
      </p>
      <button
        onClick={reset}
        className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        Try again
      </button>
    </div>
  );
}
