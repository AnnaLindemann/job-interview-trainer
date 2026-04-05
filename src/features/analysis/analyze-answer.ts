import type {
  AnalyzeAnswerParams,
  AnalyzeAnswerResult,
} from "@/src/features/analysis/analysis.types";
import { getAnalysisErrorMessage } from "@/src/features/analysis/get-analysis-error-message";
import { llmAnalyzeAnswer } from "./llm-analyze-answer";
import { mockAnalyzeAnswer } from "@/src/features/analysis/mock-analyze-answer";

export async function analyzeAnswer(
  params: AnalyzeAnswerParams
): Promise<AnalyzeAnswerResult> {
  try {
    return await llmAnalyzeAnswer(params);
  } catch (error) {
    const errorMessage = getAnalysisErrorMessage(error);

    console.error("LLM_ANALYSIS_FAILED:", {
      reason: errorMessage,
      questionText: params.questionText,
      finalAnswerLength: params.finalAnswer.trim().length,
    });

    return mockAnalyzeAnswer(params);
  }
}