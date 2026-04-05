import { FormEvent } from "react";
import Link from "next/link";

type PracticeSetupFormProps = {
  topicSlug: string;
  language: string;
  isStarting: boolean;
  onTopicChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function PracticeSetupForm(props: PracticeSetupFormProps) {
  const {
    topicSlug,
    language,
    isStarting,
    onTopicChange,
    onLanguageChange,
    onSubmit,
  } = props;

  return (
    <section className="rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold text-zinc-900">Setup</h2>
        <p className="text-sm text-zinc-500">
          Choose a topic and language to begin.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="roleSlug"
              className="text-sm font-medium text-zinc-700"
            >
              Role
            </label>
            <input
              id="roleSlug"
              value="junior-fullstack"
              disabled
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="topicSlug"
              className="text-sm font-medium text-zinc-700"
            >
              Topic
            </label>
            <select
              id="topicSlug"
              value={topicSlug}
              onChange={(event) => onTopicChange(event.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
            >
              <option value="javascript">javascript</option>
              <option value="html">html</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="language"
              className="text-sm font-medium text-zinc-700"
            >
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(event) => onLanguageChange(event.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
            >
              <option value="en">en</option>
              <option value="de">de</option>
            </select>
          </div>
        </div>

<div className="flex flex-col gap-3 sm:flex-row">
  <button
    type="submit"
    disabled={isStarting}
    className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {isStarting ? "Starting..." : "Start Practice"}
  </button>

  <Link
    href="/question-bank"
    className="inline-flex items-center justify-center rounded-2xl border border-teal-200 bg-white px-4 py-3 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
  >
    Open Question Bank
  </Link>
</div>
      </form>
    </section>
  );
}