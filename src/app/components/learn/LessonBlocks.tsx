"use client";

import { AlertTriangle, BookMarked, Lightbulb } from "lucide-react";
import type { LessonBlock } from "@/lib/learn/types";

// Renders the inline mini-markup used in lesson text: **bold** and `code`.
export function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-zinc-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={index}
              className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] text-brand-700 dark:bg-white/10 dark:text-brand-300"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

const CALLOUT_STYLES = {
  insight: {
    icon: Lightbulb,
    frame: "border-brand-500/25 bg-brand-500/[0.06]",
    label: "text-brand-600 dark:text-brand-300",
  },
  warning: {
    icon: AlertTriangle,
    frame: "border-amber-500/30 bg-amber-500/[0.07]",
    label: "text-amber-600 dark:text-amber-400",
  },
  definition: {
    icon: BookMarked,
    frame: "border-emerald-500/25 bg-emerald-500/[0.06]",
    label: "text-emerald-600 dark:text-emerald-400",
  },
} as const;

export default function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "heading":
            return (
              <h2
                key={index}
                className="pt-2 font-display text-xl font-bold tracking-tight text-zinc-900 dark:text-white"
              >
                {block.text}
              </h2>
            );
          case "p":
            return (
              <p key={index} className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                <InlineText text={block.text} />
              </p>
            );
          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag
                key={index}
                className={`space-y-2 pl-5 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 ${
                  block.ordered ? "list-decimal" : "list-disc"
                } marker:text-brand-500`}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <InlineText text={item} />
                  </li>
                ))}
              </ListTag>
            );
          }
          case "code":
            return (
              <figure key={index} className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10">
                <pre className="overflow-x-auto bg-zinc-950 p-4 text-[13px] leading-relaxed text-zinc-100">
                  <code>{block.code}</code>
                </pre>
                {block.caption && (
                  <figcaption className="border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          case "formula":
            return (
              <div
                key={index}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <p className="text-center font-mono text-[15px] font-medium text-zinc-900 dark:text-white">
                  {block.formula}
                </p>
                {block.explanation && (
                  <p className="mt-2 text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {block.explanation}
                  </p>
                )}
              </div>
            );
          case "table":
            return (
              <div key={index} className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-white/10">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04]">
                      {block.headers.map((header) => (
                        <th
                          key={header}
                          className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-zinc-100 last:border-0 dark:border-white/[0.06]"
                      >
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2.5 align-top text-zinc-700 dark:text-zinc-300">
                            <InlineText text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "callout": {
            const style = CALLOUT_STYLES[block.tone];
            const Icon = style.icon;
            return (
              <aside key={index} className={`rounded-2xl border px-4 py-3.5 ${style.frame}`}>
                <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${style.label}`}>
                  <Icon className="h-4 w-4" />
                  {block.title || block.tone}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  <InlineText text={block.text} />
                </p>
              </aside>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
