"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CircleX, RefreshCw, Trophy } from "lucide-react";
import type { QuizQuestion } from "@/lib/learn/types";

interface LessonQuizProps {
  questions: QuizQuestion[];
  /** Best score recorded so far, if any. */
  best?: number;
  onComplete: (correct: number, total: number) => void;
}

export default function LessonQuiz({ questions, best, onComplete }: LessonQuizProps) {
  // selected answer per question index; null = unanswered.
  const [selections, setSelections] = useState<(number | null)[]>(() =>
    questions.map(() => null)
  );
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = useMemo(
    () => selections.filter((selection) => selection !== null).length,
    [selections]
  );
  const correctCount = useMemo(
    () =>
      questions.reduce(
        (sum, question, index) => sum + (selections[index] === question.answer ? 1 : 0),
        0
      ),
    [questions, selections]
  );

  const choose = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    setSelections((current) =>
      current.map((selection, index) => (index === questionIndex ? optionIndex : selection))
    );
  };

  const submit = () => {
    setSubmitted(true);
    onComplete(correctCount, questions.length);
  };

  const retry = () => {
    setSelections(questions.map(() => null));
    setSubmitted(false);
  };

  return (
    <section aria-label="Lesson quiz" className="card p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-zinc-900 dark:text-white">
            Check your understanding
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {questions.length} questions — answer all to complete the lesson.
          </p>
        </div>
        {typeof best === "number" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600 dark:text-brand-300">
            <Trophy className="h-3.5 w-3.5" /> Best: {best}/{questions.length}
          </span>
        )}
      </div>

      <ol className="mt-5 space-y-6">
        {questions.map((question, questionIndex) => {
          const selection = selections[questionIndex];
          return (
            <li key={question.id}>
              <p className="text-[15px] font-medium text-zinc-900 dark:text-white">
                {questionIndex + 1}. {question.prompt}
              </p>
              <div className="mt-3 space-y-2" role="radiogroup" aria-label={`Question ${questionIndex + 1}`}>
                {question.options.map((option, optionIndex) => {
                  const chosen = selection === optionIndex;
                  const isAnswer = optionIndex === question.answer;
                  let frame =
                    "border-zinc-200 hover:border-brand-400/60 dark:border-white/10 dark:hover:border-brand-400/50";
                  if (submitted && isAnswer) {
                    frame = "border-emerald-500/60 bg-emerald-500/[0.08]";
                  } else if (submitted && chosen && !isAnswer) {
                    frame = "border-rose-500/60 bg-rose-500/[0.08]";
                  } else if (chosen) {
                    frame = "border-brand-500/70 bg-brand-500/[0.08]";
                  }
                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      role="radio"
                      aria-checked={chosen}
                      disabled={submitted}
                      onClick={() => choose(questionIndex, optionIndex)}
                      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-2.5 text-left text-sm leading-relaxed text-zinc-700 transition-colors disabled:cursor-default dark:text-zinc-300 ${frame}`}
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                        {submitted && isAnswer ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : submitted && chosen && !isAnswer ? (
                          <CircleX className="h-5 w-5 text-rose-500" />
                        ) : (
                          <span
                            className={`h-4 w-4 rounded-full border-2 ${
                              chosen
                                ? "border-brand-500 bg-brand-500"
                                : "border-zinc-300 dark:border-zinc-600"
                            }`}
                          />
                        )}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className="mt-2.5 rounded-xl bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-600 dark:bg-white/[0.04] dark:text-zinc-400">
                  <span
                    className={`font-semibold ${
                      selection === question.answer
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {selection === question.answer ? "Correct. " : "Not quite. "}
                  </span>
                  {question.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <>
            <button
              type="button"
              onClick={submit}
              disabled={answeredCount < questions.length}
              className="btn-primary px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit answers
            </button>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {answeredCount}/{questions.length} answered
            </span>
          </>
        ) : (
          <>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                correctCount === questions.length
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              {correctCount === questions.length ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Perfect — {correctCount}/{questions.length}
                </>
              ) : (
                <>
                  Score: {correctCount}/{questions.length}
                </>
              )}
            </span>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:border-brand-400/60 dark:border-white/10 dark:text-zinc-300"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Try again
            </button>
          </>
        )}
      </div>
    </section>
  );
}
