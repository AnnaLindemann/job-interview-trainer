You generate German interview question bank content from an existing English source JSON.

Your task:
- translate and adapt the English interview question bank into natural German
- preserve the same semantic meaning
- preserve the same questionKey values exactly
- keep the German version aligned to the English source item by item
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

Hard rules:
1. Return only JSON. No markdown. No explanations.
2. The root object must contain exactly one field: "items".
3. Preserve the exact number of items from the English source.
4. Preserve the exact same questionKey for each corresponding item.
5. Preserve roleSlug exactly.
6. Preserve topicSlug exactly.
7. Preserve difficulty exactly.
8. Set language = "de" for every item.
9. Translate questionText into natural, interview-appropriate German.
10. Translate referenceAnswer into clear, technically correct German.
11. Translate keyPoints into short German phrases.
12. Keep tags in English. Do NOT translate tags.
13. Do not add new items.
14. Do not remove items.
15. Do not merge items.
16. Do not split items.
17. Do not reorder items.
18. Do not change the semantic meaning of any item.
19. Do not create a new independent German question bank. This is a paired German version of the English source.
20. Keep the content suitable for a junior fullstack interview.

Critical pairing rule:
- The German item must preserve the same evaluation intent as the English item.
- If the English item is practical or scenario-based, the German version must stay practical or scenario-based.
- Do NOT simplify the German version into a more generic or more theoretical question.
- Do NOT remove concrete examples, pitfalls, or debugging context that exist in English.

Critical terminology rule:
- DO NOT translate core programming terms.
- Keep technical terms in English whenever that is standard developer usage in German-speaking teams.

Examples of terms to keep in English:
Scope, Closure, Promise, Callback, Event Loop, Hoisting, Prototype, Hook, State, Props, Component, Rendering, API, Endpoint, Request, Response, Token, Session, Query, Type, Interface, Generics, Async/Await, Chaining, Layout, Flexbox, Grid, Box Model, Media Query, Breakpoint, Selector, Specificity, Hover, Focus, Button, Input, Form, Browser, DOM

If unsure whether to translate a term:
- KEEP IT IN ENGLISH
- Do NOT invent artificial German equivalents

Write German around English technical terms:
- "Eine Closure hat Zugriff auf Variablen aus dem äußeren Scope."
- "Flexbox ist oft sinnvoll für eindimensionale Layouts."
- "Wenn ein Button wie ein Link aussieht, sollte man trotzdem das passende HTML-Element wählen."

Do NOT translate:
- code-like identifiers
- CSS properties
- selectors
- example values
- code snippets
if translation would change the meaning

Examples:
- Keep: box-sizing: border-box
- Keep: display: flex
- Keep: obj["first name"]
- Do NOT change to translated code-like content

German quality rules:
- German must sound like a real developer speaking in an interview.
- Avoid literal word-by-word translation.
- Avoid stiff or schoolbook phrasing.
- Prefer natural interview phrasing with "du" in questionText.
- Use a neutral explanatory tone in referenceAnswer; "man" is allowed there.
- Grammar must be correct.
- Sentence flow must feel natural in German even when technical terms remain in English.

Bad German patterns:
- literal translation from English sentence structure
- awkward noun chains
- article/case mistakes
- overly translated phrases that no developer would naturally say

Good German patterns:
- "Woran würdest du zuerst denken, wenn ..."
- "Wann würdest du eher X statt Y verwenden?"
- "Ein häufiger Fehler ist ..."
- "In der Praxis sieht man das oft, wenn ..."

referenceAnswer requirements:
Each answer must:
1. directly answer the question
2. preserve the full technical meaning of the English source
3. include practical context
4. include one concrete pitfall, bug, or realistic example
5. remain concise and interview-useful

Answer rules:
- 3–5 sentences
- technically correct
- concise but meaningful
- no vague filler
- no literal translation if it sounds unnatural in German
- do not lose detail from the English source

keyPoints rules:
- concise
- concrete
- technically correct
- preserve the meaning of the English source
- use English technical terms where appropriate

tags rules:
- preserve exactly as in the English source
- tags are identifiers, not prose

Example of style:

English:
"What is a closure, and when can it cause unexpected results in a loop?"

German:
"Was ist eine Closure, und wann kann sie in einer Schleife zu unerwarteten Ergebnissen führen?"

English source JSON:
{{englishSourceJson}}

Return only the JSON object.