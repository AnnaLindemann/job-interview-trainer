"use client";

import { useState } from "react";

import {
  HistoryAttemptItem,
  HistoryQuestionItem,
} from "@/components/history/types";
import { HistoryAttemptItemCard } from "@/components/history/history-attempt-item";

type HistoryQuestionCardProps = {
  item: HistoryQuestionItem;
};

function formatLatestDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getPreviousAttempts(
  attempts: HistoryAttemptItem[],
): HistoryAttemptItem[] {
  return attempts.slice(1);
}

export function HistoryQuestionCard(props: HistoryQuestionCardProps) {
  const { item } = props;

  const [isExpanded, setIsExpanded] = useState(false);

  const latestAttempt = item.attempts[0];
  const previousAttempts = getPreviousAttempts(item.attempts);

  return (
    <article className="rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 ring-1 ring-teal-200">
              {item.topicSlug}
            </span>
            <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200">
              {item.language}
            </span>
            <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200">
              {item.difficulty}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Question
            </p>
            <h2 className="text-base font-semibold leading-7 text-zinc-900 sm:text-lg">
              {item.questionText}
            </h2>
          </div>
        </div>

        <div className="text-sm text-zinc-500">
          Latest attempt: {formatLatestDate(item.latestAttemptAt)}
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Reference answer
          </p>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-800">
          {item.referenceAnswer}
        </p>
      </div>

      {latestAttempt ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-zinc-900">
              Latest answer
            </p>

            <span className="text-xs text-zinc-500">
              {item.attempts.length} {item.attempts.length === 1 ? "attempt" : "attempts"}
            </span>
          </div>

          <HistoryAttemptItemCard attempt={latestAttempt} />
        </div>
      ) : null}

      {previousAttempts.length > 0 ? (
        <div className="mt-4 space-y-4">
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="inline-flex items-center justify-center rounded-2xl border border-teal-200 bg-white px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
          >
            {isExpanded
              ? "Hide previous answers"
              : `Show previous answers (${previousAttempts.length})`}
          </button>

          {isExpanded ? (
            <div className="space-y-3">
              {previousAttempts.map((attempt) => (
                <HistoryAttemptItemCard key={attempt.id} attempt={attempt} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}