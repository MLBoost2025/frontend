"use client";

import { useState } from "react";
import MainLayout from "../components/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { createContest, createLearningTrack, createProblem } from "@/lib/api";
import { Difficulty } from "@/types";

type Tab = "problem" | "contest" | "track";
type Status = { kind: "idle" | "saving" | "ok" | "error"; message?: string };

function toLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";
const labelClass = "mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function StatusBanner({ status }: { status: Status }) {
  if (status.kind === "ok") {
    return (
      <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
        {status.message}
      </p>
    );
  }
  if (status.kind === "error") {
    return (
      <p className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
        {status.message}
      </p>
    );
  }
  return null;
}

function SubmitButton({ status, label }: { status: Status; label: string }) {
  return (
    <button
      type="submit"
      disabled={status.kind === "saving"}
      className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      {status.kind === "saving" ? "Saving…" : label}
    </button>
  );
}

function ProblemForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [tags, setTags] = useState("");
  const [starterCode, setStarterCode] = useState("");
  const [constraints, setConstraints] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "saving" });
    try {
      const result = await createProblem({
        title: title.trim(),
        description: description.trim(),
        difficulty,
        tags: toList(tags),
        starterCode: starterCode || undefined,
        constraints: toLines(constraints),
      });
      setStatus({ kind: "ok", message: `Problem created${result.slug ? ` (${result.slug})` : ""}.` });
      setTitle("");
      setDescription("");
      setTags("");
      setStarterCode("");
      setConstraints("");
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed to create problem." });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Title">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <Field label="Description">
        <textarea className={inputClass} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Difficulty">
          <select className={inputClass} value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </Field>
        <Field label="Tags (comma-separated)">
          <input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="numpy, regression" />
        </Field>
      </div>
      <Field label="Starter code">
        <textarea className={`${inputClass} font-mono`} rows={4} value={starterCode} onChange={(e) => setStarterCode(e.target.value)} placeholder="def solve():" />
      </Field>
      <Field label="Constraints (one per line)">
        <textarea className={inputClass} rows={3} value={constraints} onChange={(e) => setConstraints(e.target.value)} />
      </Field>
      <StatusBanner status={status} />
      <SubmitButton status={status} label="Create problem" />
    </form>
  );
}

function ContestForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "saving" });
    try {
      await createContest({
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });
      setStatus({ kind: "ok", message: "Contest created." });
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed to create contest." });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Title">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <Field label="Description">
        <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start time">
          <input type="datetime-local" className={inputClass} value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </Field>
        <Field label="End time">
          <input type="datetime-local" className={inputClass} value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </Field>
      </div>
      <StatusBanner status={status} />
      <SubmitButton status={status} label="Create contest" />
    </form>
  );
}

function TrackForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [lessons, setLessons] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "saving" });
    try {
      const result = await createLearningTrack({
        title: title.trim(),
        description: description.trim() || undefined,
        tags: toList(tags),
        lessons: toLines(lessons),
      });
      setStatus({ kind: "ok", message: `Track created${result.slug ? ` (${result.slug})` : ""}.` });
      setTitle("");
      setDescription("");
      setTags("");
      setLessons("");
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed to create track." });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Title">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <Field label="Description">
        <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="Tags (comma-separated)">
        <input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="supervised-learning" />
      </Field>
      <Field label="Lessons (one per line)">
        <textarea className={inputClass} rows={4} value={lessons} onChange={(e) => setLessons(e.target.value)} />
      </Field>
      <StatusBanner status={status} />
      <SubmitButton status={status} label="Create track" />
    </form>
  );
}

const TABS: { key: Tab; label: string }[] = [
  { key: "problem", label: "New Problem" },
  { key: "contest", label: "New Contest" },
  { key: "track", label: "New Track" },
];

export default function AdminPage() {
  const { isAdmin, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("problem");

  return (
    <MainLayout title="Admin" subtitle="Author problems, contests, and learning tracks">
      {isLoading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      ) : !isAdmin ? (
        <div className="rounded-xl border border-zinc-200 bg-white/90 p-6 dark:border-zinc-800 dark:bg-zinc-900/80">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Admin access required</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            This area is only available to administrators.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white/90 p-6 dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="mb-6 flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  tab === t.key
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="max-w-2xl">
            {tab === "problem" ? <ProblemForm /> : null}
            {tab === "contest" ? <ContestForm /> : null}
            {tab === "track" ? <TrackForm /> : null}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
