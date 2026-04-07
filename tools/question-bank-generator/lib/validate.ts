import type { QuestionBankItems } from "../schemas/question-bank";

type ValidateEnglishItemsParams = {
  items: QuestionBankItems;
  expectedCount: number;
  topicSlug: string;
};

type ValidateGermanItemsParams = {
  englishItems: QuestionBankItems;
  germanItems: QuestionBankItems;
  topicSlug: string;
};

function buildDuplicateMessage(values: string[], label: string): string | null {
  const duplicates = values.filter(
    (value, index) => values.indexOf(value) !== index
  );

  if (duplicates.length === 0) {
    return null;
  }

  const uniqueDuplicates = [...new Set(duplicates)];

  return `Duplicate ${label}: ${uniqueDuplicates.join(", ")}`;
}

export function validateEnglishItems(
  params: ValidateEnglishItemsParams
): void {
  const { items, expectedCount, topicSlug } = params;

  if (items.length !== expectedCount) {
    throw new Error(
      `English item count mismatch: expected ${expectedCount}, got ${items.length}`
    );
  }

  const questionKeys = items.map((item) => item.questionKey);
  const duplicateKeysMessage = buildDuplicateMessage(
    questionKeys,
    "questionKey values"
  );

  if (duplicateKeysMessage) {
    throw new Error(duplicateKeysMessage);
  }

  for (const item of items) {
    if (item.language !== "en") {
      throw new Error(
        `English item has invalid language for questionKey "${item.questionKey}": ${item.language}`
      );
    }

    if (item.topicSlug !== topicSlug) {
      throw new Error(
        `English item has invalid topicSlug for questionKey "${item.questionKey}": expected "${topicSlug}", got "${item.topicSlug}"`
      );
    }
  }
}

export function validateGermanItems(
  params: ValidateGermanItemsParams
): void {
  const { englishItems, germanItems, topicSlug } = params;

  if (germanItems.length !== englishItems.length) {
    throw new Error(
      `German item count mismatch: expected ${englishItems.length}, got ${germanItems.length}`
    );
  }

  const germanQuestionKeys = germanItems.map((item) => item.questionKey);
  const duplicateKeysMessage = buildDuplicateMessage(
    germanQuestionKeys,
    "questionKey values"
  );

  if (duplicateKeysMessage) {
    throw new Error(duplicateKeysMessage);
  }

  for (let index = 0; index < englishItems.length; index += 1) {
    const englishItem = englishItems[index];
    const germanItem = germanItems[index];

    if (!germanItem) {
      throw new Error(`Missing German item at index ${index}`);
    }

    if (germanItem.language !== "de") {
      throw new Error(
        `German item has invalid language for questionKey "${germanItem.questionKey}": ${germanItem.language}`
      );
    }

    if (germanItem.topicSlug !== topicSlug) {
      throw new Error(
        `German item has invalid topicSlug for questionKey "${germanItem.questionKey}": expected "${topicSlug}", got "${germanItem.topicSlug}"`
      );
    }

    if (germanItem.questionKey !== englishItem.questionKey) {
      throw new Error(
        `Question key mismatch at index ${index}: expected "${englishItem.questionKey}", got "${germanItem.questionKey}"`
      );
    }

    if (germanItem.roleSlug !== englishItem.roleSlug) {
      throw new Error(
        `roleSlug mismatch for questionKey "${englishItem.questionKey}": expected "${englishItem.roleSlug}", got "${germanItem.roleSlug}"`
      );
    }

    if (germanItem.topicSlug !== englishItem.topicSlug) {
      throw new Error(
        `topicSlug mismatch for questionKey "${englishItem.questionKey}": expected "${englishItem.topicSlug}", got "${germanItem.topicSlug}"`
      );
    }

    if (germanItem.difficulty !== englishItem.difficulty) {
      throw new Error(
        `difficulty mismatch for questionKey "${englishItem.questionKey}": expected "${englishItem.difficulty}", got "${germanItem.difficulty}"`
      );
    }
  }
}