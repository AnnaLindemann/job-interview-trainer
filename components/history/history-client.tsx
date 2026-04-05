"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  HistoryQuestionItem,
  HistoryResponse,
} from "@/components/history/types";
import { HistoryQuestionCard } from "@/components/history/history-question-card";

type LoadState = "idle" | "loading" | "success" | "error";

export function HistoryClient() {
  const [items, setItems] = useState<HistoryQuestionItem[]>([]);
  const [status, setStatus] = useState<LoadState>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      setStatus("loading");
      setError("");

      try {
        const response = await fetch("/api/history", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as HistoryResponse;

        if (!response.ok || !data.ok) {
          const message =
            "error" in data ? data.error : "Failed to load history";

          throw new Error(message);
        }

        if (!isMounted) {
          return;
        }

        setItems(data.data);
        setStatus("success");
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load history";

        setError(message);
        setStatus("error");
      }
    }

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-zinc-900">History</h1>
              <p className="text-sm text-zinc-500">
                Review practiced questions and all saved answer attempts.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-teal-200 bg-white px-4 py-3 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
              >
                Back to Practice
              </Link>

              <Link
                href="/question-bank"
                className="inline-flex items-center justify-center rounded-2xl border border-teal-200 bg-white px-4 py-3 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
              >
                Open Question Bank
              </Link>
            </div>
          </div>
        </section>

        {status === "loading" || status === "idle" ? (
          <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Loading history...</p>
          </section>
        ) : null}

        {status === "error" ? (
          <section className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">
                Could not load history
              </h2>
              <p className="text-sm text-zinc-600">{error}</p>
            </div>
          </section>
        ) : null}

        {status === "success" && items.length === 0 ? (
          <section className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
            <div className="space-y-3 text-center">
              <h2 className="text-lg font-semibold text-zinc-900">
                No history yet
              </h2>
              <p className="text-sm text-zinc-500">
                Start a practice session and your answered questions will appear
                here.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-500"
                >
                  Go to Practice
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {status === "success" && items.length > 0 ? (
          <section className="space-y-4">
            {items.map((item) => (
              <HistoryQuestionCard key={item.questionId} item={item} />
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}