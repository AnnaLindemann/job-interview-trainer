type FeedbackDto = {
  summary: string;
  strengths: string[];
  improvements: string[];
};

type FeedbackCardProps = {
  attemptId: string;
  technicalScore: number | null;
  grammarScore: number | null;
  feedback: FeedbackDto | null;
};

export function FeedbackCard(props: FeedbackCardProps) {
  const { attemptId, technicalScore, grammarScore, feedback } = props;

  return (
    <section className="rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold text-zinc-900">Feedback</h2>
        <p className="text-sm text-zinc-500">Your latest answer analysis.</p>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl bg-zinc-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Attempt saved
          </p>
          <p className="mt-1 text-sm text-zinc-700">
            Result saved successfully.
          </p>
          <p className="mt-2 break-all text-xs text-zinc-400">{attemptId}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
            <p className="text-sm text-teal-800">Technical score</p>
            <p className="mt-2 text-3xl font-semibold text-teal-900">
              {technicalScore ?? "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Grammar score</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-900">
              {grammarScore ?? "-"}
            </p>
          </div>
        </div>

        {feedback ? (
          <div className="space-y-4 rounded-2xl border border-zinc-200 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-900">Summary</p>
              <p className="text-sm leading-6 text-zinc-600">
                {feedback.summary}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-900">Strengths</p>
              {feedback.strengths.length > 0 ? (
                <ul className="space-y-2 text-sm text-zinc-600">
                  {feedback.strengths.map((item) => (
                    <li
                      key={item}
                      className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">No strengths yet.</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-900">Improvements</p>
              {feedback.improvements.length > 0 ? (
                <ul className="space-y-2 text-sm text-zinc-600">
                  {feedback.improvements.map((item) => (
                    <li
                      key={item}
                      className="rounded-xl bg-amber-50 px-3 py-2 text-amber-800"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">No improvements yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}