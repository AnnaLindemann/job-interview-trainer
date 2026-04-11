import { auth } from "@/auth";
import { PrintPageActions } from "@/components/question-bank/print-page-actions";
import { getQuestionBankItemsForUser } from "@/src/features/questions/get-question-bank-items";
import { parseQuestionId } from "@/src/features/questions/question-bank-list";

type PrintPageSearchParams = Promise<{
  ids?: string;
}>;

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

  const parsedSelections = ids
    .map((id) => ({
      questionId: id,
      identity: parseQuestionId(id),
    }))
    .filter(
      (
        item,
      ): item is {
        questionId: string;
        identity: NonNullable<ReturnType<typeof parseQuestionId>>;
      } => item.identity !== null,
    );

  const filterKeys = Array.from(
    new Set(
      parsedSelections.map(
        (item) => `${item.identity.topicSlug}__${item.identity.language}`,
      ),
    ),
  );

  const groupedItems = await Promise.all(
    filterKeys.map(async (filterKey) => {
      const [topicSlug, language] = filterKey.split("__");

      return getQuestionBankItemsForUser({
        userId: session.user.id,
        topicSlug,
        language,
      });
    }),
  );

  const allLoadedItems = groupedItems.flat();

  const itemsById = new Map(
    allLoadedItems.map((item) => [item.questionId, item] as const),
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
              key={item.questionId}
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
                {item.questionText}
              </h2>

              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-900">
                  Reference answer
                </p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {item.referenceAnswer}
                </p>
              </div>

              <p className="mt-5 text-xs text-gray-500">
                {item.answeredAt
                  ? `Answered: ${new Intl.DateTimeFormat("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(item.answeredAt))}`
                  : "Not answered yet"}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}