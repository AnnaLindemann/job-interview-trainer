import { prisma } from "@/src/db/prisma";
import { getQuestionsForPractice } from "@/src/features/questions/content-question-bank";

type GetFirstQuestionParams = {
  userId: string;
  roleSlug: string;
  topicSlug: string;
  language: string;
};

export async function getFirstQuestion(params: GetFirstQuestionParams) {
  const { userId, roleSlug, topicSlug, language } = params;

  const questions = await getQuestionsForPractice({
    roleSlug,
    topicSlug,
    language,
  });

  if (questions.length === 0) {
    return null;
  }

  const practicedQuestions = await prisma.practicedQuestion.findMany({
    where: {
      userId,
      roleSlug,
      topicSlug,
      language,
    },
    select: {
      questionKey: true,
    },
  });

  const practicedQuestionKeys = new Set(
    practicedQuestions.map((item) => item.questionKey),
  );

  return (
    questions.find(
      (question) => !practicedQuestionKeys.has(question.questionKey),
    ) ?? questions[0]
  );
}