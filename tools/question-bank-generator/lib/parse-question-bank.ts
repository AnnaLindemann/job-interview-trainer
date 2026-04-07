import {
  questionBankResponseSchema,
  type QuestionBankResponse,
} from "../schemas/question-bank";

export function parseQuestionBankResponse(rawContent: string): QuestionBankResponse {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawContent);
  } catch {
    throw new Error("LLM returned invalid JSON");
  }

  const parsed = questionBankResponseSchema.safeParse(parsedJson);

  if (!parsed.success) {
    throw new Error(
      `LLM returned schema-invalid question bank:\n${parsed.error.issues
        .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}`
    );
  }

  return parsed.data;
}