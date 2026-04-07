You are reviewing and improving an existing German interview question bank for junior fullstack developer screening.

Your task:
- review the existing German question bank as a full set and item by item
- use the English source as the reference for correctness, completeness, and intended interview value
- keep strong items unchanged
- rewrite only weak, unnatural, literal, grammatically incorrect, technically inaccurate, shallow, repetitive, low-signal, or low-value items
- preserve the same JSON structure
- return ONLY valid JSON

Return ONLY a valid JSON object with this exact shape:
{
  "items": [
    {
      "questionKey": "string",
      "roleSlug": "string",
      "topicSlug": "string",
      "language": "de",
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
- Rewrite only items that are weak, unnatural, literal, grammatically incorrect, technically inaccurate, too shallow, repetitive, or not useful for interview evaluation.
- Stylistic preference alone is NOT a reason to rewrite.
- However, if the set has repeated patterns, low-signal questions, or unnatural German, you MUST rewrite enough items to fix the quality problem.
- Do not preserve weak German just because the meaning is roughly correct.

Hard rules:
1. Return only JSON. No markdown. No explanations.
2. The root object must contain exactly one field: "items".
3. Preserve the exact number of items.
4. Preserve the exact same questionKey for each item.
5. Preserve roleSlug exactly as "{{roleSlug}}".
6. Preserve topicSlug exactly as "{{topicSlug}}".
7. Preserve language = "de" for every item.
8. Preserve difficulty unless it is clearly wrong.
9. Preserve tags exactly unless they are clearly misleading.
10. Do not add new items.
11. Do not remove items.
12. Do not merge items.
13. Do not split items.
14. Do not reorder items.
15. Do not change the semantic meaning of the item.
16. Stay strictly within the topic "{{topicTitle}}".

Review the set as a collection:
Check for:
- repeated subtopics
- repeated question shapes
- repeated answer patterns
- too many low-signal beginner questions
- insufficient coverage diversity
- unnatural German repeated across the set
- items that became more generic in German than in English

Quality gate:
Rewrite any item if:
- it is too broad or generic
- it mainly tests memorized theory instead of applied understanding
- it overlaps significantly with another item in the same set
- it sounds like a literal translation
- it contains awkward or unnatural German phrasing
- it contains grammar mistakes
- it loses practical detail from the English source
- it can be answered with vague statements about UX, SEO, accessibility, or maintainability without concrete knowledge
- it lacks practical interview value

Critical terminology rule:
- DO NOT translate core programming terms.
- Keep technical terms in English inside German sentences whenever that is standard developer usage.

Examples of terms to keep in English:
Scope, Closure, Promise, Callback, Event Loop, Hoisting, State, Props, Component, Rendering, API, Endpoint, Request, Response, Token, Session, Query, Type, Interface, Generics, Async/Await, block-scoped, function-scoped, Container, Image, Volume, Layer, Port, Branch, Merge, Commit, Join, Index, Schema, Foreign Key, Constraint, Hash, OAuth, JWT, CORS, Layout, Flexbox, Grid, Box Model, Media Query, Breakpoint, Selector, Specificity, Hover, Focus, DOM, Browser

If unsure whether to translate a technical term:
- KEEP IT IN ENGLISH
- Do NOT invent German equivalents

German quality rules:
- German must sound like a real developer speaking in an interview.
- Avoid literal word-by-word translation.
- Avoid stiff or overly translated phrasing.
- Keep natural German sentence flow around English technical terms.
- questionText should use natural interview phrasing, usually with "du".
- referenceAnswer should use a neutral explanatory tone; "man" is allowed.
- grammar must be correct.

Bad German patterns:
- unnatural literal translations
- stiff phrases no developer would naturally say
- grammar errors in articles, cases, or sentence structure
- awkward mixed terminology
- translated phrasing that weakens the original practical meaning

Good German patterns:
- "Woran würdest du zuerst denken, wenn ..."
- "Wann würdest du eher X statt Y verwenden?"
- "Ein häufiger Fehler ist ..."
- "In der Praxis sieht man das oft, wenn ..."
- "Das Problem entsteht häufig, weil ..."

Review criteria for questionText:
- Must sound like a real interview question in German
- Must not sound like a literal translation
- Must test understanding, not definition recall
- Must preserve the same evaluation intent as the English source
- If the English question is practical, the German question must also be practical

Review criteria for referenceAnswer:
Each answer must include:
1. direct explanation
2. practical context
3. one concrete bug, pitfall, or realistic example

Answer rules:
- 3–5 sentences
- technically correct
- concise but meaningful
- use the English source as the reference for completeness
- if the German version lost detail or meaning, restore it
- useful for interviewer evaluation
- avoid vague filler
- avoid literal translation when it sounds unnatural

Important threshold:
- An answer that is technically correct but lacks practical context or a concrete example is still too weak and should be improved.
- A short answer is acceptable only if it still includes explanation, practical context, and one concrete pitfall or example.
- A German answer that is semantically correct but sounds translated is still too weak.

Duplicate handling:
- If two items test nearly the same concept, do NOT merge them.
- Instead, make them distinct by changing the angle.
- Example: one item can focus on direct behavior, while the other focuses on a common bug, debugging situation, or implementation choice.

keyPoints rules:
- must be concise, concrete, and technically correct
- should use English technical terms where appropriate
- avoid unnatural translated terminology
- preserve the meaning of the English source
- 3–5 keyPoints per item

tags rules:
- preserve existing tags unless clearly wrong
- tags are identifiers, not prose

English source JSON:
{{existingEnglishJson}}

Existing German JSON:
{{existingGermanJson}}

Return only the JSON object.