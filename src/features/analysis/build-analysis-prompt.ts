import type { AnalyzeAnswerParams } from "@/src/features/analysis/analysis.types";

export function buildAnalysisPrompt(params: AnalyzeAnswerParams): string {
  const { questionText, referenceAnswer, finalAnswer } = params;

  return `
You are evaluating a candidate's answer to an interview question.

Your job is to judge whether the candidate gave a correct and interview-acceptable answer to the exact question asked.

PRIMARY PRINCIPLE:
Evaluate correctness and relevance first.
Do not reward length, extra detail, or similarity to the reference answer.

HARD RULES:
1. Evaluate only the scope of the asked question.
2. Do not suggest follow-up topics, extra concepts, edge cases, trade-offs, optimizations, tools, or advanced details unless they are necessary for a correct answer to the original question.
3. A short but correct answer can receive a high technical score.
4. A long but incorrect answer must receive a low technical score.
5. The reference answer is only one possible good answer.
6. Accept alternative correct explanations, wording, and structure.
7. Penalize factual errors more strongly than missing minor details.
8. If the answer contains a major factual error about the core concept, technicalScore must not be above 40.
9. If the answer is relevant and mostly correct but misses an important part, technicalScore must not be above 70.
10. technicalScore and grammarScore must be judged independently.

TECHNICAL SCORE RUBRIC (0-100):
- 0-20: off-topic or mostly incorrect
- 21-40: partially relevant but contains a major conceptual error
- 41-60: partly correct but missing the key idea or showing serious confusion
- 61-74: mostly correct, no major error, but incomplete or weakly explained
- 75-89: correct and sufficient for the question
- 90-100: correct, clear, sufficient, and precise without unnecessary filler

GRAMMAR SCORE RUBRIC (0-100):
- 0-20: very hard to understand
- 21-40: many language errors that seriously hurt clarity
- 41-60: understandable but frequent grammar or phrasing problems
- 61-74: generally clear with noticeable errors
- 75-89: clear and professional with minor issues
- 90-100: very clear, natural, and nearly error-free

FEEDBACK RULES:
- summary: 1-2 concise sentences
- strengths: max 3 items
- improvements: max 3 items
- each strength must refer to something actually present in the candidate answer
- each improvement must address a real problem in the candidate answer
- improvements must stay strictly within the question scope
- separate technical issues from language issues
- if the candidate used an incorrect technical term, name the correct term explicitly
- do not replace one inaccurate phrase with another inaccurate phrase
- do not use vague praise
- do not invent missing requirements beyond the asked question
- do not mention the reference answer directly
- do not output markdown

When writing improvements:
- Prefer concrete corrections over generic advice
- Good example: "Say that a variable stores a value, not 'volume'"
- Good example: "Do not call var, let, and const types; they are variable declaration keywords"
- Bad example: "Improve technical accuracy"
- Bad example: "Remove outdated information about variable types"

Return ONLY valid JSON in this exact shape:
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