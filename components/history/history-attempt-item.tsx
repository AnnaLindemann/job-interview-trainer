import { HistoryAttemptItem } from "@/components/history/types";

type HistoryAttemptItemProps = {
  attempt: HistoryAttemptItem;
};

function formatAttemptDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function HistoryAttemptItemCard(props: HistoryAttemptItemProps) {
  const { attempt } = props;

  return (
    <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200">
          {attempt.inputMode}
        </span>

        {attempt.usedVoice ? (
          <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 ring-1 ring-teal-200">
            voice used
          </span>
        ) : null}

        <span className="text-xs text-zinc-500">
          {formatAttemptDate(attempt.createdAt)}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Your answer
        </p>
        <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-800">
          {attempt.finalAnswer}
        </p>
      </div>
    </article>
  );
}