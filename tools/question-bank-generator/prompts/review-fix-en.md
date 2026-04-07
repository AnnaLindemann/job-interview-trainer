You are reviewing and improving an existing English interview question bank for junior fullstack developer screening.

Your task:
- review the existing English question bank as a full set and item by item
- keep strong items unchanged
- rewrite only weak, vague, repetitive, technically inaccurate, shallow, low-signal, or low-value items
- preserve the same JSON structure
- return ONLY valid JSON

Return ONLY a valid JSON object with this exact shape:
{
  "items": [
    {
      "questionKey": "string",
      "roleSlug": "string",
      "topicSlug": "string",
      "language": "en",
      "difficulty": "EASY" | "MEDIUM" | "HARD",
      "questionText": "string",
      "referenceAnswer": "string",
      "keyPoints": ["string"],
      "tags": ["string"]
    }
  ]
}

Core review rule:
- Keep strong items unchanged.
- Rewrite only items that are weak, generic, repetitive, unclear, factually inaccurate, too shallow, or not useful for interview evaluation.
- Stylistic preference alone is NOT a reason to rewrite.
- However, if the set has repeated patterns, low-signal questions, or obvious overlap, you MUST rewrite enough items to fix the quality problem.
- Do not be lazy about preserving weak items just because they are technically valid.

Hard rules:
1. Return only JSON. No markdown. No explanations.
2. The root object must contain exactly one field: "items".
3. Preserve the exact number of items.
4. Preserve the exact same questionKey for each item.
5. Preserve roleSlug exactly as "{{roleSlug}}".
6. Preserve topicSlug exactly as "{{topicSlug}}".
7. Preserve language = "en" for every item.
8. Preserve difficulty unless it is clearly wrong.
9. Preserve tags unless they are clearly misleading.
10. Do not add new items.
11. Do not remove items.
12. Do not merge items.
13. Do not split items.
14. Do not reorder items.
15. Stay strictly within the topic "{{topicTitle}}".
16. Use ONLY these focus areas as the allowed scope:
{{focusAreas}}

Review the set as a collection:
Check for:
- repeated subtopics
- repeated question shapes
- repeated answer patterns
- too many low-signal beginner questions
- insufficient coverage diversity
- too many textbook-style items

Quality gate:
Reject or rewrite any item if:
- it is too broad or generic
- it mainly tests memorized theory instead of applied understanding
- it overlaps significantly with another item in the same set
- it can be answered with vague statements about accessibility, SEO, UX, or maintainability without concrete knowledge
- it lacks practical interview value
- it sounds more like documentation or a tutorial heading than an interview question

Important threshold:
- Do NOT preserve a weak item just because it is factually correct.
- A technically correct but low-signal item is still weak.
- A question that invites generic filler is weak even if the topic itself is valid.

Weak patterns that should usually be rewritten:
- "Why is X important?"
- "What are the benefits of X?"
- "How does X improve user experience?"
- "What are the best practices for X?" without a concrete situation
- "What is X?" without a practical angle
- very broad prompts that could be answered with stock phrases

Stronger patterns:
- practical scenario
- debugging angle
- common mistake
- implementation choice
- contrast between related concepts
- browser behavior in a real UI context

Review criteria for questionText:
- Must sound like a real interview question
- Must test understanding, not memorized definitions
- Must not be overly academic or textbook-like
- Prefer behavior-based phrasing when possible
- Prefer questions that reveal misunderstandings or common mistakes
- Avoid commands like "Define", "List", "Write"

Review criteria for referenceAnswer:
Each answer must include:
1. direct explanation
2. practical context
3. one concrete bug, pitfall, or realistic example

Answer rules:
- 3–5 sentences
- technically correct
- concise but meaningful
- useful for interviewer evaluation
- avoid vague filler
- avoid broad generic claims unless explained concretely

Bad patterns:
- generic definitions without context
- filler such as "this can lead to unexpected behavior"
- weak warnings without explanation
- broad statements that do not help evaluate a candidate
- empty phrases about accessibility, SEO, UX, or maintainability without concrete detail

Better patterns:
- contrast similar concepts when relevant
- explain actual runtime or browser behavior
- mention a realistic mistake or debugging path
- show why the distinction matters in practice
- add nuance when a simple one-liner would be incomplete

Duplicate handling:
- If two items test nearly the same concept, do NOT merge them.
- Instead, make them distinct by changing the angle.
- Example: one item can focus on direct behavior, while another focuses on a common bug, debugging scenario, or implementation tradeoff.

keyPoints rules:
- must be concrete and checkable
- must reflect what a strong candidate should mention
- avoid vague labels or broad topic names
- 3–5 keyPoints per item

tags rules:
- short
- lowercase
- useful for grouping
- keep existing tags unless they are clearly wrong

Existing English JSON:
{{existingEnglishJson}}

Return only the JSON object.