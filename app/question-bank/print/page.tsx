import { auth } from "@/auth";
import { prisma } from "@/src/db/prisma";
import { PrintPageActions } from "@/components/question-bank/print-page-actions";

type PrintPageSearchParams = Promise<{
  ids?: string;
}>;

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function parseIds(rawIds: string | undefined): string[] {
  if (!rawIds) {
    return [];
  }

  return rawIds
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

type PrintQuestionBankPageProps = {
  searchParams: PrintPageSearchParams;
};

export default async function PrintQuestionBankPage({
  searchParams,
}: PrintQuestionBankPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const resolvedSearchParams = await searchParams;
  const ids = parseIds(resolvedSearchParams.ids);

  if (ids.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Question Bank
              </p>
              <h1 className="text-2xl font-semibold text-gray-900">
                Print Question Bank
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                No selected questions were provided.
              </p>
            </div>

            <PrintPageActions />
          </div>
        </div>
      </main>
    );
  }

  const practicedQuestions = await prisma.practicedQuestion.findMany({
    where: {
      id: {
        in: ids,
      },
      userId: session.user.id,
    },
    select: {
      id: true,
      questionKey: true,
      questionTextSnapshot: true,
      referenceAnswerSnapshot: true,
      roleSlug: true,
      topicSlug: true,
      language: true,
      difficulty: true,
      addedAt: true,
    },
  });

  const itemsById = new Map(
    practicedQuestions.map((item) => [item.id, item] as const),
  );

  const orderedItems = ids
    .map((id) => itemsById.get(id))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm print:mb-8 print:border print:shadow-none">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Question Bank Export
            </p>
            <h1 className="text-3xl font-semibold text-gray-900">
              Selected Questions
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Selected questions for practice, review, or assessment.
            </p>
          </div>

          <PrintPageActions />
        </div>
      </section>

      {orderedItems.length === 0 ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">
            No accessible questions were found for printing.
          </p>
        </section>
      ) : (
        <div className="space-y-6">
          {orderedItems.map((item, index) => (
            <article
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm print:break-inside-avoid print:shadow-none"
            >
              <div className="mb-4 flex flex-wrap gap-2 text-xs font-medium text-gray-500">
                <span>#{index + 1}</span>
                <span>•</span>
                <span>{item.roleSlug}</span>
                <span>•</span>
                <span>{item.topicSlug}</span>
                <span>•</span>
                <span>{item.language}</span>
                <span>•</span>
                <span>{item.difficulty}</span>
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                {item.questionTextSnapshot}
              </h2>

              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-900">
                  Reference answer
                </p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {item.referenceAnswerSnapshot}
                </p>
              </div>

              <p className="mt-5 text-xs text-gray-500">
                Added: {formatDate(item.addedAt)}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}