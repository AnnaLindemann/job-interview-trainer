type QuestionDto = {
  id: string;
  roleSlug: string;
  topicSlug: string;
  language: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questionText: string;
};

type QuestionCardProps = {
  question: QuestionDto | null;
};

export function QuestionCard(props: QuestionCardProps) {
  const { question } = props;

  return (
    <section className="rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-zinc-900">Current question</h2>
          <p className="text-sm text-zinc-500">
            Your active interview question for this round.
          </p>
        </div>

        {question ? (
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
            {question.difficulty}
          </span>
        ) : null}
      </div>

      {question ? (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
              {question.topicSlug}
            </span>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
              {question.language}
            </span>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
              {question.roleSlug}
            </span>
          </div>

          <div className="rounded-2xl border border-teal-100 bg-teal-50/40 p-4 sm:p-5">
            <p className="text-sm leading-7 text-zinc-900 sm:text-base">
              {question.questionText}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-teal-200 bg-zinc-50 p-5">
          <p className="text-sm text-zinc-500">
            No question yet. Start a session first.
          </p>
        </div>
      )}
    </section>
  );
}