"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type QuestionBankItem = {
  questionId: string;
  questionKey: string;
  questionText: string;
  referenceAnswer: string;
  roleSlug: string;
  topicSlug: string;
  language: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  answered: boolean;
  answeredAt: string | null;
};

type LoadState = "idle" | "loading" | "success" | "error";

type QuestionBankMeta = {
  languages: string[];
  topics: string[];
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getDifficultyClasses(
  difficulty: QuestionBankItem["difficulty"],
): string {
  if (difficulty === "EASY") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (difficulty === "HARD") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export function QuestionBankClient() {
  const router = useRouter();

  const [items, setItems] = useState<QuestionBankItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [meta, setMeta] = useState<QuestionBankMeta>({
    languages: [],
    topics: [],
  });
  const [status, setStatus] = useState<LoadState>("idle");
  const [error, setError] = useState<string>("");

  const shouldLoadQuestions =
    topicFilter !== "all" || languageFilter !== "all";

  useEffect(() => {
    let isMounted = true;

    async function loadMeta() {
      try {
        const response = await fetch("/api/question-bank/meta", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as
          | {
              ok: true;
              data: QuestionBankMeta;
            }
          | {
              ok: false;
              error: string;
            };

        if (!response.ok || !data.ok) {
          throw new Error(data.ok ? "Failed to load metadata" : data.error);
        }

        if (!isMounted) {
          return;
        }

        setMeta(data.data);
      } catch (metaError) {
        if (!isMounted) {
          return;
        }

        const message =
          metaError instanceof Error
            ? metaError.message
            : "Failed to load metadata";

        setError(message);
      }
    }

    void loadMeta();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadItems() {
      if (!shouldLoadQuestions) {
        setItems([]);
        setStatus("idle");
        setError("");
        return;
      }

      setStatus("loading");
      setError("");

      try {
        const params = new URLSearchParams();

        if (topicFilter !== "all") {
          params.set("topicSlug", topicFilter);
        }

        if (languageFilter !== "all") {
          params.set("language", languageFilter);
        }

        const response = await fetch(`/api/questions?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as
          | {
              ok: true;
              data: {
                items: QuestionBankItem[];
              };
            }
          | {
              ok: false;
              error: string;
            };

        if (!response.ok || !data.ok) {
          throw new Error(data.ok ? "Failed to load questions" : data.error);
        }

        if (!isMounted) {
          return;
        }

        setItems(data.data.items);
        setStatus("success");
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load questions";

        setError(message);
        setStatus("error");
        setItems([]);
      }
    }

    void loadItems();

    return () => {
      isMounted = false;
    };
  }, [topicFilter, languageFilter, shouldLoadQuestions]);

  const visibleIds = useMemo(() => {
    return items.map((item) => item.questionId);
  }, [items]);

  const selectedVisibleCount = useMemo(() => {
    const visibleSet = new Set(visibleIds);

    return selectedIds.filter((id) => visibleSet.has(id)).length;
  }, [selectedIds, visibleIds]);

  const answeredCount = useMemo(() => {
    return items.filter((item) => item.answered).length;
  }, [items]);

  function handleToggleSelect(questionId: string) {
    setSelectedIds((current) => {
      const isSelected = current.includes(questionId);

      if (isSelected) {
        return current.filter((id) => id !== questionId);
      }

      return [...current, questionId];
    });
  }

  function handleSelectAllVisible() {
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
                    Interview question bank
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
                    Choose a topic and/or language to load questions from the
                    content bank, mark answered questions, and print selected
                    items as PDF.
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
                      {meta.topics.map((topic) => (
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
                      {meta.languages.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2 text-sm text-teal-800">
                    Selected: {selectedIds.length}
                  </div>

                  <div className="rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2 text-sm text-teal-800">
                    Visible selected: {selectedVisibleCount}
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectAllVisible}
                    disabled={items.length === 0}
                    className="rounded-2xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-medium text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Select visible
                  </button>

                  <button
                    type="button"
                    onClick={handleClearSelection}
                    disabled={selectedIds.length === 0}
                    className="rounded-2xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-medium text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear selection
                  </button>
                </div>
              </div>

              {shouldLoadQuestions && items.length > 0 ? (
                <div className="rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2 text-sm text-teal-800">
                  Answered in current result: {answeredCount}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
            </div>
          </section>

          {!shouldLoadQuestions ? (
            <section className="rounded-3xl border border-dashed border-teal-200 bg-white/90 p-6 shadow-sm">
              <p className="text-sm text-zinc-500">
                Select a topic or a language to load questions.
              </p>
            </section>
          ) : null}

          {shouldLoadQuestions && status === "loading" ? (
            <section className="rounded-3xl border border-teal-100 bg-white/90 p-6 shadow-sm">
              <p className="text-sm text-zinc-500">Loading questions...</p>
            </section>
          ) : null}

          {shouldLoadQuestions &&
          status !== "loading" &&
          items.length === 0 &&
          !error ? (
            <section className="rounded-3xl border border-dashed border-teal-200 bg-white/90 p-6 shadow-sm">
              <p className="text-sm text-zinc-500">
                No questions match the current filters.
              </p>
            </section>
          ) : null}

          {shouldLoadQuestions && status === "success" && items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => {
                const isSelected = selectedIds.includes(item.questionId);

                return (
                  <article
                    key={item.questionId}
                    className="rounded-3xl border border-teal-100 bg-white/90 p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <label className="inline-flex w-fit items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(item.questionId)}
                            className="h-4 w-4 accent-teal-600"
                          />
                          Select
                        </label>

                        {item.answered ? (
                          <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Answered
                          </span>
                        ) : (
                          <span className="inline-flex w-fit items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600">
                            Not answered yet
                          </span>
                        )}
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
                            item.difficulty,
                          )}`}
                        >
                          {item.difficulty}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-zinc-900 sm:text-xl">
                          {item.questionText}
                        </h2>

                        {item.answeredAt ? (
                          <p className="text-xs text-zinc-500">
                            Answered: {formatDate(item.answeredAt)}
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-500">
                            No attempts yet
                          </p>
                        )}
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
          ) : null}
        </div>
      </div>
    </main>
  );
}