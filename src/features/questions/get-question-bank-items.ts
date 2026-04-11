import { readFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/src/db/prisma";
import {
  buildAnsweredKey,
  buildQuestionId,
  type QuestionBankJsonItem,
  type QuestionBankListItem,
} from "@/src/features/questions/question-bank-list";

const QUESTION_BANK_ROOT = path.join(
  process.cwd(),
  "src",
  "content",
  "question-bank",
);

type GetQuestionBankItemsForUserOptions = {
  userId: string;
  topicSlug?: string;
  language?: string;
};

function getQuestionBankFilePath(language: string, topicSlug: string): string {
  return path.join(QUESTION_BANK_ROOT, language, `${topicSlug}.json`);
}

async function readQuestionBankFile(
  language: string,
  topicSlug: string,
): Promise<QuestionBankJsonItem[]> {
  const filePath = getQuestionBankFilePath(language, topicSlug);
  const fileContent = await readFile(filePath, "utf-8");
  const trimmedContent = fileContent.trim();

  if (trimmedContent.length === 0) {
    throw new Error(
      `Question bank file is empty: ${path.relative(process.cwd(), filePath)}`,
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmedContent);
  } catch (error) {
    throw new Error(
      `Invalid JSON in question bank file: ${path.relative(process.cwd(), filePath)}`,
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      `Question bank file must contain an array: ${path.relative(process.cwd(), filePath)}`,
    );
  }

  const items: QuestionBankJsonItem[] = [];

  for (const rawItem of parsed) {
    const item = rawItem as Partial<QuestionBankJsonItem>;

    if (
      typeof item.questionKey !== "string" ||
      typeof item.roleSlug !== "string" ||
      typeof item.topicSlug !== "string" ||
      typeof item.language !== "string" ||
      typeof item.difficulty !== "string" ||
      typeof item.questionText !== "string" ||
      typeof item.referenceAnswer !== "string"
    ) {
      continue;
    }

    items.push({
      questionKey: item.questionKey,
      roleSlug: item.roleSlug,
      topicSlug: item.topicSlug,
      language: item.language,
      difficulty: item.difficulty as QuestionBankJsonItem["difficulty"],
      questionText: item.questionText,
      referenceAnswer: item.referenceAnswer,
      keyPoints: item.keyPoints,
      tags: item.tags,
    });
  }

  return items;
}

async function readQuestionBankItemsByFilters(options: {
  topicSlug?: string;
  language?: string;
}): Promise<QuestionBankJsonItem[]> {
  const { topicSlug, language } = options;

  if (topicSlug && language) {
    return readQuestionBankFile(language, topicSlug);
  }

  if (!topicSlug && !language) {
    throw new Error("At least one filter is required to load question bank items");
  }

  const result: QuestionBankJsonItem[] = [];

  if (language && !topicSlug) {
    const selectedLanguage = language;
    const languageDirPath = path.join(QUESTION_BANK_ROOT, selectedLanguage);

    const { readdir } = await import("node:fs/promises");
    const entries = await readdir(languageDirPath, { withFileTypes: true });

    const topicSlugs = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name.replace(/\.json$/, ""));

    for (const currentTopicSlug of topicSlugs) {
      const items = await readQuestionBankFile(
        selectedLanguage,
        currentTopicSlug,
      );
      result.push(...items);
    }

    return result;
  }

  if (!language && topicSlug) {
    const selectedTopicSlug = topicSlug;

    const { readdir } = await import("node:fs/promises");
    const languageEntries = await readdir(QUESTION_BANK_ROOT, {
      withFileTypes: true,
    });

    const languages = languageEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    for (const currentLanguage of languages) {
      const items = await readQuestionBankFile(
        currentLanguage,
        selectedTopicSlug,
      );
      result.push(...items);
    }

    return result;
  }

  return result;
}

export async function getQuestionBankItemsForUser(
  options: GetQuestionBankItemsForUserOptions,
): Promise<QuestionBankListItem[]> {
  const practicedQuestions = await prisma.practicedQuestion.findMany({
    where: {
      userId: options.userId,
    },
    select: {
      roleSlug: true,
      topicSlug: true,
      language: true,
      questionKey: true,
      addedAt: true,
    },
  });

  const answeredMap = new Map<string, Date>();

  for (const practicedQuestion of practicedQuestions) {
    const answeredKey = buildAnsweredKey({
      roleSlug: practicedQuestion.roleSlug,
      topicSlug: practicedQuestion.topicSlug,
      language: practicedQuestion.language,
      questionKey: practicedQuestion.questionKey,
    });

    const existing = answeredMap.get(answeredKey);

    if (!existing || practicedQuestion.addedAt > existing) {
      answeredMap.set(answeredKey, practicedQuestion.addedAt);
    }
  }

  const allItems = await readQuestionBankItemsByFilters({
    topicSlug: options.topicSlug,
    language: options.language,
  });

  return allItems
    .filter((item) => {
      const matchesTopic =
        !options.topicSlug || item.topicSlug === options.topicSlug;

      const matchesLanguage =
        !options.language || item.language === options.language;

      return matchesTopic && matchesLanguage;
    })
    .map((item) => {
      const answeredKey = buildAnsweredKey({
        roleSlug: item.roleSlug,
        topicSlug: item.topicSlug,
        language: item.language,
        questionKey: item.questionKey,
      });

      const answeredAt = answeredMap.get(answeredKey);

      return {
        questionId: buildQuestionId({
          roleSlug: item.roleSlug,
          topicSlug: item.topicSlug,
          language: item.language,
          questionKey: item.questionKey,
        }),
        questionKey: item.questionKey,
        questionText: item.questionText,
        referenceAnswer: item.referenceAnswer,
        roleSlug: item.roleSlug,
        topicSlug: item.topicSlug,
        language: item.language,
        difficulty: item.difficulty,
        answered: Boolean(answeredAt),
        answeredAt: answeredAt ? answeredAt.toISOString() : null,
      };
    })
    .sort((a, b) => a.questionText.localeCompare(b.questionText));
}