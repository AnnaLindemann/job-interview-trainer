import { z } from "zod";

export const createAttemptSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  inputMode: z.enum(["TEXT", "VOICE"]),
  rawTranscript: z.string().nullable(),
  finalAnswer: z.string().trim().min(1),
  usedVoice: z.boolean(),
});

export type CreateAttemptInput = z.infer<typeof createAttemptSchema>;