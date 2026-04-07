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

  const practicedQuestions = await prisma.practicedQuestion.findMany({
    where: {
      userId,
      roleSlug: session.roleSlug,
      topicSlug: session.topicSlug,
      language: session.language,
    },
    select: {
      questionKey: true,
    },
  });

  const practicedQuestionKeys = new Set(
    practicedQuestions.map((item) => item.questionKey),
  );

  const questions = await getQuestionsForPractice({
    roleSlug: session.roleSlug,
    topicSlug: session.topicSlug,
    language: session.language,
  });

  if (questions.length === 0) {
    return null;
  }

  return (
    questions.find(
      (question) => !practicedQuestionKeys.has(question.questionKey),
    ) ?? questions[0]
  );
}