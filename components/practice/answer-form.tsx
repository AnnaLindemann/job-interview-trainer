import { FormEvent } from "react";

type AnswerFormProps = {
  answer: string;
  isSubmitting: boolean;
  onAnswerChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AnswerForm(props: AnswerFormProps) {
  const { answer, isSubmitting, onAnswerChange, onSubmit } = props;

  return (
    <section className="rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold text-zinc-900">Your answer</h2>
        <p className="text-sm text-zinc-500">
          Start with text input. Voice mode will be added next.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label htmlFor="answer" className="text-sm font-medium text-zinc-700">
            Answer text
          </label>
          <textarea
            id="answer"
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder="Write your answer here..."
            rows={8}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-teal-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting ? "Saving..." : "Submit answer"}
        </button>
      </form>
    </section>
  );
}