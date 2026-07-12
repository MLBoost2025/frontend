"use client";

import { useCallback, useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { useAuth } from "@/context/AuthContext";
import {
  createContest,
  createLearningTrack,
  createProblem,
  deleteContest,
  deleteLearningTrack,
  deleteProblem,
  fetchCompetitions,
  fetchLearningTracks,
  fetchProblemBySlug,
  fetchProblems,
  updateContest,
  updateLearningTrack,
  updateProblem,
} from "@/lib/api";
import {
  Competition,
  Difficulty,
  LearningTrack,
  NewContestInput,
  NewLearningTrackInput,
  NewProblemInput,
  Problem,
} from "@/types";

type ContentType = "problem" | "contest" | "track";
type Mode = "create" | "manage";
type Status = { kind: "idle" | "saving" | "ok" | "error"; message?: string };

const inputClass =
  "w-full rounded-xl bg-zinc-100/80 px-3.5 py-2.5 text-sm text-zinc-900 outline-none ring-1 ring-black/[0.04] transition focus:bg-white focus:ring-brand-400/50 dark:bg-white/[0.06] dark:text-zinc-100 dark:ring-white/[0.04] dark:focus:bg-white/[0.09]";
const labelClass = "mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300";

function toLines(value: string): string[] {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function toList(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function toLocalDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function StatusBanner({ status }: { status: Status }) {
  if (status.kind !== "ok" && status.kind !== "error") return null;
  const success = status.kind === "ok";
  return (
    <p
      role={success ? "status" : "alert"}
      className={`rounded-xl px-3.5 py-2.5 text-sm ${
        success
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
      }`}
    >
      {status.message}
    </p>
  );
}

function SubmitButton({ status, label }: { status: Status; label: string }) {
  return (
    <button type="submit" disabled={status.kind === "saving"} className="btn-primary disabled:opacity-50">
      {status.kind === "saving" ? "Saving…" : label}
    </button>
  );
}

function ProblemForm({
  initial,
  editId,
  onSaved,
}: {
  initial?: NewProblemInput;
  editId?: string;
  onSaved?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? "Easy");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [starterCode, setStarterCode] = useState(initial?.starterCode ?? "");
  const [constraints, setConstraints] = useState((initial?.constraints ?? []).join("\n"));
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus({ kind: "saving" });
    const input: NewProblemInput = {
      title: title.trim(),
      description: description.trim(),
      difficulty,
      tags: toList(tags),
      starterCode: starterCode || undefined,
      constraints: toLines(constraints),
    };
    try {
      const result = editId ? await updateProblem(editId, input) : await createProblem(input);
      setStatus({
        kind: "ok",
        message: editId ? "Problem updated." : `Problem created${result.slug ? ` (${result.slug})` : ""}.`,
      });
      if (editId) onSaved?.();
      else {
        setTitle("");
        setDescription("");
        setTags("");
        setStarterCode("");
        setConstraints("");
      }
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Failed to save problem." });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Title"><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required /></Field>
      <Field label="Description"><textarea className={inputClass} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Difficulty">
          <select className={inputClass} value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
        </Field>
        <Field label="Tags (comma-separated)"><input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="numpy, regression" /></Field>
      </div>
      <Field label="Starter code"><textarea className={`${inputClass} font-mono`} rows={4} value={starterCode} onChange={(e) => setStarterCode(e.target.value)} placeholder="def solve():" /></Field>
      <Field label="Constraints (one per line)"><textarea className={inputClass} rows={3} value={constraints} onChange={(e) => setConstraints(e.target.value)} /></Field>
      <StatusBanner status={status} />
      <SubmitButton status={status} label={editId ? "Save changes" : "Create problem"} />
    </form>
  );
}

function ContestForm({ initial, editId, onSaved }: { initial?: NewContestInput; editId?: string; onSaved?: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startTime, setStartTime] = useState(initial ? toLocalDateTime(initial.startTime) : "");
  const [endTime, setEndTime] = useState(initial ? toLocalDateTime(initial.endTime) : "");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus({ kind: "saving" });
    const input: NewContestInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    };
    try {
      if (editId) await updateContest(editId, input);
      else await createContest(input);
      setStatus({ kind: "ok", message: editId ? "Contest updated." : "Contest created." });
      if (editId) onSaved?.();
      else {
        setTitle(""); setDescription(""); setStartTime(""); setEndTime("");
      }
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Failed to save contest." });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Title"><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required /></Field>
      <Field label="Description"><textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start time"><input type="datetime-local" className={inputClass} value={startTime} onChange={(e) => setStartTime(e.target.value)} required /></Field>
        <Field label="End time"><input type="datetime-local" className={inputClass} value={endTime} onChange={(e) => setEndTime(e.target.value)} required /></Field>
      </div>
      <StatusBanner status={status} />
      <SubmitButton status={status} label={editId ? "Save changes" : "Create contest"} />
    </form>
  );
}

function TrackForm({ initial, editId, onSaved }: { initial?: NewLearningTrackInput; editId?: string; onSaved?: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [lessons, setLessons] = useState((initial?.lessons ?? []).join("\n"));
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus({ kind: "saving" });
    const input: NewLearningTrackInput = {
      title: title.trim(), description: description.trim() || undefined,
      tags: toList(tags), lessons: toLines(lessons), order,
    };
    try {
      const result = editId ? (await updateLearningTrack(editId, input), {}) : await createLearningTrack(input);
      setStatus({ kind: "ok", message: editId ? "Track updated." : `Track created${result.slug ? ` (${result.slug})` : ""}.` });
      if (editId) onSaved?.();
      else { setTitle(""); setDescription(""); setTags(""); setLessons(""); setOrder(0); }
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Failed to save track." });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Title"><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required /></Field>
      <Field label="Description"><textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <Field label="Tags (comma-separated)"><input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="supervised-learning" /></Field>
        <Field label="Order"><input type="number" className={inputClass} value={order} onChange={(e) => setOrder(Number(e.target.value))} /></Field>
      </div>
      <Field label="Lessons (one per line)"><textarea className={inputClass} rows={4} value={lessons} onChange={(e) => setLessons(e.target.value)} /></Field>
      <StatusBanner status={status} />
      <SubmitButton status={status} label={editId ? "Save changes" : "Create track"} />
    </form>
  );
}

type ManageItem = Problem | Competition | LearningTrack;

function ManageContent({ type }: { type: ContentType }) {
  const [items, setItems] = useState<ManageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [editing, setEditing] = useState<ManageItem | null>(null);
  const [problemInitial, setProblemInitial] = useState<NewProblemInput | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = type === "problem" ? await fetchProblems() : type === "contest" ? await fetchCompetitions() : await fetchLearningTracks();
      setItems(data);
      setStatus({ kind: "idle" });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Failed to load content." });
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { void load(); }, [load]);

  async function startEdit(item: ManageItem) {
    setStatus({ kind: "idle" });
    if (type === "problem") {
      setLoading(true);
      try {
        const problem = item as Problem;
        const detail = await fetchProblemBySlug(problem.slug ?? "");
        setProblemInitial({
          title: detail.title, description: detail.description, difficulty: detail.difficulty,
          tags: detail.tags, starterCode: detail.starterCode, constraints: detail.constraints,
        });
        setEditing(item);
      } catch (error) {
        setStatus({ kind: "error", message: error instanceof Error ? error.message : "Failed to load problem." });
      } finally { setLoading(false); }
      return;
    }
    setEditing(item);
  }

  async function remove(item: ManageItem) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setStatus({ kind: "saving", message: "Deleting…" });
    try {
      if (type === "problem") await deleteProblem(item.id);
      else if (type === "contest") await deleteContest(item.id);
      else await deleteLearningTrack(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setStatus({ kind: "ok", message: `${type === "track" ? "Track" : type[0].toUpperCase() + type.slice(1)} deleted.` });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Delete failed." });
    }
  }

  if (editing) {
    const done = () => { setEditing(null); setProblemInitial(null); void load(); };
    return (
      <div>
        <button type="button" onClick={() => { setEditing(null); setProblemInitial(null); }} className="mb-5 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">← Back to list</button>
        <div className="mb-5"><p className="eyebrow">Editing</p><h2 className="mt-1 text-xl font-semibold">{editing.title}</h2></div>
        {type === "problem" && problemInitial ? <ProblemForm initial={problemInitial} editId={editing.id} onSaved={done} /> : null}
        {type === "contest" ? <ContestForm initial={editing as Competition} editId={editing.id} onSaved={done} /> : null}
        {type === "track" ? <TrackForm initial={editing as LearningTrack} editId={editing.id} onSaved={done} /> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StatusBanner status={status} />
      {loading ? <p className="text-sm text-zinc-500">Loading content…</p> : items.length === 0 ? (
        <div className="rounded-2xl bg-zinc-100/70 p-6 text-center text-sm text-zinc-500 dark:bg-white/[0.04] dark:text-zinc-400">No content yet.</div>
      ) : items.map((item) => (
        <div key={item.id} className="flex flex-col gap-3 rounded-2xl bg-zinc-100/70 p-4 dark:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><h3 className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3><p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">{item.description || ("difficulty" in item ? item.difficulty : "No description")}</p></div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => void startEdit(item)} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:text-brand-600 dark:bg-white/[0.08] dark:text-zinc-200">Edit</button>
            <button type="button" onClick={() => void remove(item)} className="rounded-full bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-500/15 dark:text-rose-300">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const TYPES: { key: ContentType; label: string }[] = [
  { key: "problem", label: "Problems" }, { key: "contest", label: "Contests" }, { key: "track", label: "Tracks" },
];

export default function AdminPage() {
  const { isAdmin, isLoading } = useAuth();
  const [type, setType] = useState<ContentType>("problem");
  const [mode, setMode] = useState<Mode>("create");

  return (
    <MainLayout title="Admin" subtitle="Create and manage platform content">
      {isLoading ? <p className="text-sm text-zinc-500">Loading…</p> : !isAdmin ? (
        <div className="card p-6"><h2 className="text-lg font-semibold">Admin access required</h2><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">This area is only available to administrators.</p></div>
      ) : (
        <div className="card p-5 sm:p-7">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-fit rounded-full bg-zinc-100 p-1 dark:bg-white/[0.05]" aria-label="Content type">
              {TYPES.map((item) => <button key={item.key} type="button" onClick={() => setType(item.key)} className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${type === item.key ? "bg-white text-zinc-900 shadow-sm dark:bg-white/[0.12] dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"}`}>{item.label}</button>)}
            </div>
            <div className="flex w-fit rounded-full bg-zinc-100 p-1 dark:bg-white/[0.05]" aria-label="Admin mode">
              {(["create", "manage"] as Mode[]).map((item) => <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-full px-3.5 py-2 text-sm font-semibold capitalize transition ${mode === item ? "bg-brand-500 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"}`}>{item}</button>)}
            </div>
          </div>
          <div className="max-w-3xl">
            {mode === "manage" ? <ManageContent key={type} type={type} /> : type === "problem" ? <ProblemForm /> : type === "contest" ? <ContestForm /> : <TrackForm />}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
