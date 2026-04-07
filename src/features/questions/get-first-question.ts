import { getQuestionsForPractice } from "@/src/features/questions/content-question-bank";

type GetFirstQuestionParams = {
  roleSlug: string;
  topicSlug: string;
  language: string;
};

export async function getFirstQuestion(params: GetFirstQuestionParams) {
  const questions = await getQuestionsForPractice(params);

  return questions[0] ?? null;
}