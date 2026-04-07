import { z } from "zod";

export const questionBankItemSchema = z.object({
  questionKey: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid questionKey format"),
  roleSlug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid roleSlug format"),
  topicSlug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid topicSlug format"),
  language: z.enum(["en", "de"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  questionText: z.string().min(1),
  referenceAnswer: z.string().min(1),
  keyPoints: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)).min(1),
});

export const questionBankItemsSchema = z.array(questionBankItemSchema);

export const questionBankResponseSchema = z.object({
  items: questionBankItemsSchema,
});

export type QuestionBankItem = z.infer<typeof questionBankItemSchema>;
export type QuestionBankItems = z.infer<typeof questionBankItemsSchema>;
export type QuestionBankResponse = z.infer<typeof questionBankResponseSchema>;