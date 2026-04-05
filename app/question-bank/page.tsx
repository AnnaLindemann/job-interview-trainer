import { auth } from "@/auth";
import { prisma } from "@/src/db/prisma";
import { QuestionBankClient } from "@/components/question-bank/question-bank-client";

export type QuestionBankItem = {
  practicedQuestionId: string;
  questionId: string;
  questionText: string;
  referenceAnswer: string;
  roleSlug: string;
  topicSlug: string;
  language: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  addedAt: string;
};

async function getQuestionBankForCurrentUser(): Promise<QuestionBankItem[]> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const practicedQuestions = await prisma.practicedQuestion.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      addedAt: "desc",
    },
    select: {
      id: true,
      addedAt: true,
      question: {
        select: {
          id: true,
          questionText: true,
          referenceAnswer: true,
          roleSlug: true,
          topicSlug: true,
          language: true,
          difficulty: true,
        },
      },
    },
  });

  return practicedQuestions.map((item) => ({
    practicedQuestionId: item.id,
    questionId: item.question.id,
    questionText: item.question.questionText,
    referenceAnswer: item.question.referenceAnswer,
    roleSlug: item.question.roleSlug,
    topicSlug: item.question.topicSlug,
    language: item.question.language,
    difficulty: item.question.difficulty,
    addedAt: item.addedAt.toISOString(),
  }));
}

export default async function QuestionBankPage() {
  const items = await getQuestionBankForCurrentUser();

  return <QuestionBankClient initialItems={items} />;
}