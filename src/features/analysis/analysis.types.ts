export type AnalyzeAnswerParams = {
  questionText: string;
  referenceAnswer: string;
  finalAnswer: string;
};

export type AnalyzeAnswerResult = {
  summary: string;
  strengths: string[];
  improvements: string[];
  technicalScore: number | null;
  grammarScore: number | null;
};