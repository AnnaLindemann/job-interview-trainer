"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type QuestionBankItem = {
  practicedQuestionId: string;
  questionId: string;
  questionText: string;
  referenceAnswer: string;
  roleSlug: string;
  topicSlug: string;
  language: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  addedAt: string;
};

type QuestionBankClientProps = {
  initialItems: QuestionBankItem[];
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getDifficultyClasses(
  difficulty: QuestionBankItem["difficulty"]
): string {
  if (difficulty === "EASY") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (difficulty === "HARD") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export function QuestionBankClient({
  initialItems,
}: QuestionBankClientProps) {
  const router = useRouter();

  const [items, setItems] = useState<QuestionBankItem[]>(initialItems);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const topicOptions = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.topicSlug))).sort();
  }, [items]);

  const languageOptions = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.language))).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesTopic =
        topicFilter === "all" || item.topicSlug === topicFilter;

      const matchesLanguage =
        languageFilter === "all" || item.language === languageFilter;

      return matchesTopic && matchesLanguage;
    });
  }, [items, topicFilter, languageFilter]);

  function handleToggleSelect(practicedQuestionId: string) {
    setSelectedIds((current) => {
      const isSelected = current.includes(practicedQuestionId);

      if (isSelected) {
        return current.filter((id) => id !== practicedQuestionId);
      }

      return [...current, practicedQuestionId];
    });
  }

  function handleSelectAllVisible() {
    const visibleIds = filteredItems.map((item) => item.practicedQuestionId);

    setSelectedIds((current) => {
      const next = new Set(current);

      for (const id of visibleIds) {
        next.add(id);
      }

      return Array.from(next);
    });
  }

  function handleClearSelection() {
    setSelectedIds([]);
  }

  function handlePrintSelected() {
    if (selectedIds.length === 0) {
      return;
    }

    const params = new URLSearchParams({
      ids: selectedIds.join(","),
    });

    router.push(`/question-bank/print?${params.toString()}`);
  }

  async function handleDelete(practicedQuestionId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question from the Question Bank?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(practicedQuestionId);
    setError("");

    try {
      const response = await fetch(`/api/question-bank/${practicedQuestionId}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as
        | {
            ok: true;
            data: {
              deletedId: string;
            };
          }
        | {
            ok: false;
            error: string;
          };

      if (!response.ok || !data.ok) {
        throw new Error(data.ok ? "Failed to delete item" : data.error);
      }

      setItems((current) =>
        current.filter(
          (item) => item.practicedQuestionId !== practicedQuestionId
        )
      );

      setSelectedIds((current) =>
        current.filter((id) => id !== practicedQuestionId)
      );
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete item";

      setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
         <section className="space-y-4">
  <span className="inline-flex rounded-full border border-teal-200 bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800 shadow-sm">
    Question Bank
  </span>

  <div className="rounded-3xl border border-teal-100 bg-white/90 p-6 shadow-sm sm:p-8">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Your practiced interview questions
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          Review unique questions you have already practiced, filter them, select
          them, and print selected items as PDF.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-[220px]">
        <button
          type="button"
          onClick={handlePrintSelected}
          disabled={selectedIds.length === 0}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-teal-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Print / Save PDF
        </button>

        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-2xl border border-teal-200 bg-white px-4 py-3 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
        >
          Back to Practice
        </Link>
      </div>
    </div>
  </div>
</section>

     <section className="rounded-3xl border border-teal-100 bg-white/90 p-5 shadow-sm sm:p-6">
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Topic</span>
          <select
            value={topicFilter}
            onChange={(event) => setTopicFilter(event.target.value)}
            className="rounded-2xl border border-teal-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-teal-400"
          >
            <option value="all">All topics</option>
            {topicOptions.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Language</span>
          <select
            value={languageFilter}
            onChange={(event) => setLanguageFilter(event.target.value)}
            className="rounded-2xl border border-teal-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-teal-400"
          >
            <option value="all">All languages</option>
            {languageOptions.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2 text-sm text-teal-800">
          Selected: {selectedIds.length}
        </div>

        <button
          type="button"
          onClick={handleSelectAllVisible}
          className="rounded-2xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
        >
          Select visible
        </button>

        <button
          type="button"
          onClick={handleClearSelection}
          className="rounded-2xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
        >
          Clear selection
        </button>
      </div>
    </div>

    {error ? (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    ) : null}
  </div>
</section>
          {filteredItems.length === 0 ? (
            <section className="rounded-3xl border border-dashed border-teal-200 bg-white/90 p-6 shadow-sm">
              <p className="text-sm text-zinc-500">
                No questions match the current filters yet.
              </p>
            </section>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.practicedQuestionId);
                const isDeleting = deletingId === item.practicedQuestionId;

                return (
                  <article
                    key={item.practicedQuestionId}
                    className="rounded-3xl border border-teal-100 bg-white/90 p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <label className="inline-flex w-fit items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              handleToggleSelect(item.practicedQuestionId)
                            }
                            className="h-4 w-4 accent-teal-600"
                          />
                          Select
                        </label>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.practicedQuestionId)}
                          disabled={isDeleting}
                          className="rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 font-medium text-teal-700">
                          {item.roleSlug}
                        </span>
                        <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 font-medium text-teal-700">
                          {item.topicSlug}
                        </span>
                        <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 font-medium text-teal-700">
                          {item.language}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-1 font-medium ${getDifficultyClasses(
                            item.difficulty
                          )}`}
                        >
                          {item.difficulty}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-zinc-900 sm:text-xl">
                          {item.questionText}
                        </h2>
                        <p className="text-xs text-zinc-500">
                          Added: {formatDate(item.addedAt)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
                        <p className="mb-2 text-sm font-semibold text-zinc-900">
                          Reference answer
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                          {item.referenceAnswer}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}