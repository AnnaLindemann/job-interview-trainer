import type {
  AnalyzeAnswerParams,
  AnalyzeAnswerResult,
} from "@/src/features/analysis/analysis.types";
import { mockAnalyzeAnswer } from "@/src/features/analysis/mock-analyze-answer";

export async function analyzeAnswer(
  params: AnalyzeAnswerParams
): Promise<AnalyzeAnswerResult> {
  return mockAnalyzeAnswer(params);
}