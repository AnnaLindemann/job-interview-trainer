import { z } from "zod";

export const analysisResponseSchema = z.object({
  summary: z.string().trim().min(1).max(1000),
  strengths: z.array(z.string().trim().min(1).max(300)).min(1).max(5),
  improvements: z.array(z.string().trim().min(1).max(300)).min(1).max(5),
  technicalScore: z.number().int().min(0).max(100).nullable(),
  grammarScore: z.number().int().min(0).max(100).nullable(),
});

export type AnalysisResponseSchema = z.infer<typeof analysisResponseSchema>;