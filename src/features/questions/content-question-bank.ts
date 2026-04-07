import { readFile } from "node:fs/promises";
import path from "node:path";

import { Difficulty } from "@/app/generated/prisma/client";

type RawQuestionBankItem = {
  questionKey: unknown;
  roleSlug: unknown;
  topicSlug: unknown;
  language: unknown;
  difficulty: unknown;
  questionText: unknown;
  referenceAnswer: unknown;
  keyPoints?: unknown;
  tags?: unknown;
  isActive?: unknown;
};

export type ContentQuestion = {
  id: string;
  questionKey: string;
  roleSlug: string;
  topicSlug: string;
  language: string;
  difficulty: Difficulty;
  questionText: string;
  referenceAnswer: string;
  keyPoints: string[];
  tags: string[];
  isActive: boolean;
};

type LoadQuestionBankParams = {
  topicSlug: string;
  language: string;
};

type FindQuestionParams = {
  roleSlug: string;
  topicSlug: string;
  language: string;
  questionKey: string;
};

const QUESTION_BANK_ROOT = path.join(
  process.cwd(),
  "src",
  "content",
  "question-bank",
);

function isDifficulty(value: unknown): value is Difficulty {
  return value === "EASY" || value === "MEDIUM" || value === "HARD";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function normalizeQuestion(item: RawQuestionBankItem): ContentQuestion | null {
  if (
    typeof item.questionKey !== "string" ||
    typeof item.roleSlug !== "string" ||
    typeof item.topicSlug !== "string" ||
    typeof item.language !== "string" ||
    !isDifficulty(item.difficulty) ||
    typeof item.questionText !== "string" ||
    typeof item.referenceAnswer !== "string"
  ) {
    return null;
  }

  return {
    id: item.questionKey,
    questionKey: item.questionKey,
    roleSlug: item.roleSlug,
    topicSlug: item.topicSlug,
    language: item.language,
    difficulty: item.difficulty,
    questionText: item.questionText,
    referenceAnswer: item.referenceAnswer,
    keyPoints: isStringArray(item.keyPoints) ? item.keyPoints : [],
    tags: isStringArray(item.tags) ? item.tags : [],
    isActive: item.isActive === false ? false : true,
  };
}

export async function loadTopicQuestionBank(
  params: LoadQuestionBankParams,
): Promise<ContentQuestion[]> {
  const filePath = path.join(
    QUESTION_BANK_ROOT,
    params.language,
    `${params.topicSlug}.json`,
  );

  const fileContent = await readFile(filePath, "utf8");
  const parsed: unknown = JSON.parse(fileContent);

  if (!Array.isArray(parsed)) {
    throw new Error(`Question bank file must contain an array: ${filePath}`);
  }

  return parsed
    .map((item) => normalizeQuestion(item as RawQuestionBankItem))
    .filter((item): item is ContentQuestion => item !== null);
}

export async function getQuestionsForPractice(params: {
  roleSlug: string;
  topicSlug: string;
  language: string;
}): Promise<ContentQuestion[]> {
  const questions = await loadTopicQuestionBank({
    topicSlug: params.topicSlug,
    language: params.language,
  });

  return questions.filter(
    (question) =>
      question.roleSlug === params.roleSlug &&
      question.topicSlug === params.topicSlug &&
      question.language === params.language &&
      question.isActive,
  );
}

export async function findQuestionInContentBank(
  params: FindQuestionParams,
): Promise<ContentQuestion | null> {
  const questions = await getQuestionsForPractice({
    roleSlug: params.roleSlug,
    topicSlug: params.topicSlug,
    language: params.language,
  });

  return (
    questions.find((question) => question.questionKey === params.questionKey) ??
    null
  );
}