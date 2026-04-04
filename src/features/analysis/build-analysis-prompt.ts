import type { AnalyzeAnswerParams } from "@/src/features/analysis/analysis.types";

export function buildAnalysisPrompt(params: AnalyzeAnswerParams): string {
  const { questionText, referenceAnswer, finalAnswer } = params;

  return `
You are evaluating a candidate's interview answer for an AI interview practice app.

Your task:
Evaluate the candidate answer against the interview question and the reference answer.

Scoring rules:
- technicalScore: evaluate technical correctness, relevance, clarity, and completeness
- grammarScore: evaluate grammar, wording, readability, and language quality
- Scores must be integers from 0 to 100
- If a score cannot be judged fairly, return null

Response rules:
- Return ONLY valid JSON
- Do not use markdown
- Do not add explanations outside JSON
- Keep strengths and improvements concise
- strengths: 2 to 4 items
- improvements: 2 to 4 items
- summary: 1 to 3 sentences

Required JSON shape:
{
  "summary": "string",
  "strengths": ["string"],
  "improvements": ["string"],
  "technicalScore": 0,
  "grammarScore": 0
}

Interview question:
${JSON.stringify(questionText)}

Reference answer:
${JSON.stringify(referenceAnswer)}

Candidate answer:
${JSON.stringify(finalAnswer)}
`.trim();
}