import type {  AnalyzeAnswerParams, AnalyzeAnswerResult } from "./analysis.types";

export function mockAnalyzeAnswer(
  params: AnalyzeAnswerParams
): AnalyzeAnswerResult {
  const { finalAnswer } = params;

  const normalizedAnswer = finalAnswer.trim();
  const answerLength = normalizedAnswer.length;

  let technicalScore = 40;
  let grammarScore = 40;

  if (answerLength >= 80) {
    technicalScore = 65;
    grammarScore = 60;
  }

  if (answerLength >= 160) {
    technicalScore = 78;
    grammarScore = 72;
  }

  if (answerLength >= 260) {
    technicalScore = 86;
    grammarScore = 80;
  }

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (answerLength >= 80) {
    strengths.push("The answer is not too short.");
  } else {
    improvements.push("Add a more complete explanation.");
  }

  if (
    normalizedAnswer.includes("let") ||
    normalizedAnswer.includes("const")
  ) {
    strengths.push("You included concrete JavaScript terms.");
  } else {
    improvements.push("Use more concrete technical terms.");
  }

  if (normalizedAnswer.split(" ").length >= 12) {
    strengths.push("The answer has some development.");
  } else {
    improvements.push("Expand the answer with one or two more points.");
  }

  return {
    summary:
      answerLength >= 80
        ? "Good start. The answer covers the basics but can be more precise."
        : "The answer is too short and should be expanded.",
    strengths,
    improvements,
    technicalScore,
    grammarScore,
  };
}