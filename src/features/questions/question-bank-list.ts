export type QuestionBankDifficulty = "EASY" | "MEDIUM" | "HARD";

export type QuestionBankListItem = {
  questionId: string;
  questionKey: string;
  questionText: string;
  referenceAnswer: string;
  roleSlug: string;
  topicSlug: string;
  language: string;
  difficulty: QuestionBankDifficulty;
  answered: boolean;
  answeredAt: string | null;
};

export type QuestionBankJsonItem = {
  questionKey: string;
  roleSlug: string;
  topicSlug: string;
  language: string;
  difficulty: QuestionBankDifficulty;
  questionText: string;
  referenceAnswer: string;
  keyPoints?: unknown;
  tags?: unknown;
};

export type QuestionIdentity = {
  roleSlug: string;
  topicSlug: string;
  language: string;
  questionKey: string;
};

export function buildQuestionId(identity: QuestionIdentity): string {
  return [
    identity.roleSlug,
    identity.topicSlug,
    identity.language,
    identity.questionKey,
  ]
    .map((part) => encodeURIComponent(part))
    .join("::");
}

export function parseQuestionId(questionId: string): QuestionIdentity | null {
  const parts = questionId.split("::");

  if (parts.length !== 4) {
    return null;
  }

  const [roleSlug, topicSlug, language, questionKey] = parts.map((part) =>
    decodeURIComponent(part),
  );

  if (!roleSlug || !topicSlug || !language || !questionKey) {
    return null;
  }

  return {
    roleSlug,
    topicSlug,
    language,
    questionKey,
  };
}

export function buildAnsweredKey(identity: QuestionIdentity): string {
  return `${identity.roleSlug}__${identity.topicSlug}__${identity.language}__${identity.questionKey}`;
}