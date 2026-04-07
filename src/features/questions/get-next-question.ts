import { prisma } from "@/src/db/prisma";
import { getQuestionsForPractice } from "@/src/features/questions/content-question-bank";

type GetNextQuestionParams = {
  sessionId: string;
  userId: string;
};

export async function getNextQuestion(params: GetNextQuestionParams) {
  const { sessionId, userId } = params;

  const session = await prisma.practiceSession.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      userId: true,
      roleSlug: true,
      topicSlug: true,
      language: true,
    },
  });

  if (!session || session.userId !== userId) {
    return null;
  }

  const attempts = await prisma.attempt.findMany({
    where: {
      sessionId,
    },
    select: {
      questionKey: true,
    },
  });

  const attemptedQuestionKeys = new Set(
    attempts.map((attempt) => attempt.questionKey),
  );

  const questions = await getQuestionsForPractice({
    roleSlug: session.roleSlug,
    topicSlug: session.topicSlug,
    language: session.language,
  });

  return (
    questions.find((question) => !attemptedQuestionKeys.has(question.questionKey)) ??
    null
  );
}