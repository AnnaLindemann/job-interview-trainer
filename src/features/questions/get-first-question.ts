import { prisma } from "@/src/db/prisma";

type GetFirstQuestionParams = {
  roleSlug: string;
  topicSlug: string;
  language: string;
};

export async function getFirstQuestion(params: GetFirstQuestionParams) {
  const { roleSlug, topicSlug, language } = params;

  console.log("getFirstQuestion params:", {
    roleSlug,
    topicSlug,
    language,
  });

  const question = await prisma.question.findFirst({
    where: {
      roleSlug,
      topicSlug,
      language,
      isActive: true,
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
      isActive: true,
      createdAt: true,
    },
  });

  console.log("getFirstQuestion db result:", question);

  return question;
}