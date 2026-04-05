import { prisma } from "@/src/db/prisma";

type GetNextQuestionParams = {
  sessionId: string;
};

export async function getNextQuestion(params: GetNextQuestionParams) {
  const { sessionId } = params;

  const session = await prisma.practiceSession.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      roleSlug: true,
      topicSlug: true,
      language: true,
    },
  });

  if (!session) {
    return null;
  }

  const attempts = await prisma.attempt.findMany({
    where: {
      sessionId,
    },
    select: {
      questionId: true,
    },
  });

  const attemptedQuestionIds = attempts.map((attempt) => attempt.questionId);

  const question = await prisma.question.findFirst({
    where: {
      roleSlug: session.roleSlug,
      topicSlug: session.topicSlug,
      language: session.language,
      isActive: true,
      id: {
        notIn: attemptedQuestionIds.length > 0 ? attemptedQuestionIds : undefined,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      roleSlug: true,
      topicSlug: true,
      language: true,
      difficulty: true,
      questionText: true,
      referenceAnswer: true,
      isActive: true,
      createdAt: true,
    },
  });

  return question;
}