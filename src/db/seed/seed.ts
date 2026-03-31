import { prisma, pool } from "../prisma";
import { juniorFullstackEnQuestions } from "./questions/junior-fullstack.en";

async function main() {
  await prisma.question.deleteMany({
    where: {
      roleSlug: "junior-fullstack",
      language: "en",
    },
  });

  await prisma.question.createMany({
    data: juniorFullstackEnQuestions.map((question) => ({
      roleSlug: question.roleSlug,
      topicSlug: question.topicSlug,
      language: question.language,
      difficulty: question.difficulty,
      questionText: question.questionText,
      referenceAnswer: question.referenceAnswer,
      keyPoints: question.keyPoints,
      tags: question.tags,
    })),
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });