"use client";

import Link from "next/link";

export function PrintPageActions() {
  return (
    <div className="flex flex-wrap gap-3 print:hidden">
      <Link
        href="/question-bank"
        className="inline-flex items-center justify-center rounded-2xl border border-teal-200 bg-white px-4 py-3 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
      >
        Back to Question Bank
      </Link>

      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-500"
      >
        Print / Save as PDF
      </button>
    </div>
  );
}