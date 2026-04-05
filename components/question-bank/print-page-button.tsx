"use client";

export function PrintPageButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center rounded-2xl border border-teal-200 bg-white px-4 py-3 text-sm font-medium text-teal-700 transition hover:bg-teal-50 print:hidden"
    >
      Print / Save as PDF
    </button>
  );
}