# Question Bank Prompt Review & Proposal

Date: 2026-04-06
Scope: `tools/question-bank-generator/prompts/generate-en.md`
Model: Groq / Llama 3.3 70B (temperature 0.2)

---

## 1. Current Prompt Assessment

### What is working

- **JSON structure enforcement** is solid. The schema rules (1-5) are clear and leave no room for ambiguity. The pipeline gets valid JSON.
- **Question form guidance** (rule 6) with explicit "do not use" and "prefer" forms is effective. Most generated questions do follow conversational interview phrasing.
- **Few-shot examples** (3 items) are well-chosen. They demonstrate the right tone, answer depth, and key-point style. This is the strongest quality lever in the prompt.
- **Topic pinning** via `{{topicSlug}}`, `{{topicTitle}}`, and `{{focusAreas}}` placeholders works mechanically.
- **Negative examples** for weak questions (rule 9a) and weak keyPoints (rule 11b) help prevent the worst cases.

### What is not working

**Problem 1: Answers are shallow and formulaic.**
Looking at the generated JavaScript file, almost every `referenceAnswer` follows the same template:
> "[Concept] does X. However, this can lead to unexpected behavior if Y."

The phrase "unexpected behavior" appears in nearly half the answers. The answers lack concrete examples, real-world context, and meaningful nuance. They read like paraphrased documentation, not like what a strong candidate would say.

Example — `js-promise-chaining`:
> "To handle promise chaining, you can use the 'then' method to attach a callback function to the promise. This callback function receives the resolved value and can return another promise..."

This is a textbook restatement. It doesn't mention error handling with `.catch()`, doesn't compare to `async/await`, doesn't mention a common mistake. It wouldn't help evaluate a real candidate.

**Problem 2: Questions drift outside focus areas.**
`js-object-prototype-chain` appeared in a generation where focus areas were `["variables", "scope", "functions", "arrays and objects", "promises"]`. Prototype chain is explicitly called out in rule 8b as excluded unless listed, yet it was generated anyway. The model is ignoring the negative constraint.

**Problem 3: Near-duplicate content.**
`js-closure-variable-scope` and `js-function-closure` are essentially the same question with the same answer. `js-const-strict-mode` and `js-variable-reassignment` overlap heavily. The prompt says "avoid near-duplicate questions" but gives no mechanism to enforce it.

**Problem 4: Factual errors slip through.**
`js-const-strict-mode` claims reassigning a `const` variable in non-strict mode "will silently fail without throwing an error." This is **factually wrong** — `const` reassignment throws a `TypeError` in both strict and non-strict mode in all modern engines. The prompt has no guardrail against hallucinated edge cases.

**Problem 5: keyPoints are generic.**
Many keyPoints are restatements of the answer rather than evaluation criteria. Example from `js-function-closure`:
- "unexpected behavior can occur"
- "use closures carefully"

These are not things an interviewer can check for. They don't describe what a candidate should *say*.

### What is too restrictive

- **Rule 8b** lists 9 excluded topics by name. This is fragile — the model may not reliably track a negative list this long. It also creates a false sense of safety; the model generated `prototype-chain` content anyway.
- **Rule 3a/3b** (count verification) asks the LLM to self-verify array length. LLMs are poor at counting. This should be handled by the pipeline validator, not the prompt. It adds prompt weight without adding quality.

### What is too vague

- **"concise but meaningful, usually 3 to 5 sentences"** — this tells the model a length target but not a *content* target. The model hits 3 sentences by padding with filler ("be aware of the implications", "this can lead to unexpected behavior").
- **"test understanding, practical usage, or common mistakes"** — too abstract. The model doesn't know what "practical usage" looks like for a specific focus area.
- **"stay strictly within the provided focus areas"** — the model has no clear definition of what's inside vs outside a focus area. "Prototype chain" could be argued as related to "objects."
- **Quality bar section** at the end repeats earlier rules in vaguer language. It doesn't add signal.

### What causes weak interview-quality output

The root cause is a **structural mismatch**: the prompt spends ~60% of its tokens on JSON formatting, counting, and key naming rules — things the model handles easily — and ~15% on the actual quality guidance that determines whether questions are good. The quality instructions are scattered across rules 6-11 and a "quality bar" block, making them easy for the model to deprioritize.

Additionally, the model (Llama 3.3 70B) at temperature 0.2 will heavily lean on patterns from training data. Without strong answer-structure guidance, it defaults to generic textbook-style answers. The few-shot examples are good but there are only 3 and they're all JavaScript-basics — the model may not generalize the style to other topics.

---

## 2. Quality Criteria

### Question wording
- Sounds like something a human interviewer would actually ask in a 30-minute junior screening
- Tests understanding of *behavior* or *tradeoffs*, not definition recall
- Specific enough that there's a right and wrong answer (not "tell me about X")
- Anchored to a focus area with no ambiguity about which one

### Reference answers
- **Structure**: Lead with the core answer (1-2 sentences), then practical context (when/why it matters), then one concrete example or common mistake
- **Factual accuracy**: No invented edge cases or hallucinated behavior
- **Depth**: Enough to evaluate a candidate against, but not a blog post. A senior interviewer reading it should think "yes, that covers the essential points"
- **Tone**: Direct and technical, not hedging ("however, be aware that...")
- **Anti-patterns to avoid**: "this can lead to unexpected behavior", "be aware of the implications", "use X carefully"

### Key points
- Each keyPoint = one checkable claim a candidate should make
- Phrased as a factual statement, not a label
- Bad: "array creation" / Good: "spread operator creates a shallow copy, not a deep copy"
- 3-5 per question; each should be distinct

### Topic discipline
- A question belongs to a focus area if removing that focus area would make the question irrelevant
- If a question could belong to any of 3+ focus areas equally, it's too broad
- The focus area should be identifiable from the question alone

### Practical interview value
- Would this question differentiate a candidate who read MDN for 2 hours from one who has built something?
- Does the answer reveal understanding of *why*, not just *what*?

---

## 3. Risks and Trade-offs

### Shorter prompt vs stronger control
The current prompt is ~168 lines. Making it shorter would reduce noise, but cutting rules without replacement risks regression. **Recommendation**: restructure rather than shorten — consolidate scattered quality rules into one focused section, remove rules the pipeline already enforces.

### More rules vs more confusion
Adding more rules (especially negative examples) can cause the model to over-index on avoidance rather than generation. The current prompt already has this problem: rule 8b lists 9 excluded topics, rule 9a lists bad questions, rule 11b lists bad keyPoints. **Recommendation**: keep negative examples minimal, invest more in positive examples that demonstrate the target quality.

### Few-shot examples vs copying
With only 3 examples at temperature 0.2, the model will closely mimic their patterns. The current `js-array-map-vs-foreach` example was nearly duplicated verbatim in the output. More examples (5-6) with deliberate variety in structure would reduce copying while strengthening the style signal. **Recommendation**: add 3 more examples with different topics and answer structures, and strengthen the "do not copy" instruction.

### Concise answers vs shallow answers
The "3 to 5 sentences" guideline is being interpreted as a ceiling rather than a quality floor. Short answers become shallow when the model optimizes for sentence count. **Recommendation**: replace the sentence count with a content checklist (core answer + practical context + example/mistake), which naturally produces 3-5 sentences but ensures substance.

### Single prompt vs structured sections
The current prompt mixes persona, schema, examples, rules, and quality guidance in one flat list. LLMs respond better to clearly separated sections with headers. **Recommendation**: restructure into named sections with clear priorities.

---

## 4. Proposed Prompt Design

### Design principles
1. **Separate infrastructure from quality.** Schema rules and counting belong in a short, skippable block. Quality guidance gets prime real estate.
2. **Lead with identity and goal.** Tell the model *who it is* and *what good looks like* before listing constraints.
3. **Use a content template for answers.** Instead of vague "concise but meaningful," give a 3-part structure the model must follow.
4. **Expand examples to 5-6** with variety in topic, difficulty, and answer style.
5. **Remove rules the pipeline enforces.** Count verification, JSON-only output reminders, and key format rules can be lighter since the parse layer catches violations.
6. **Strengthen focus-area anchoring.** Make the model name which focus area each question targets.

### Proposed prompt structure

```markdown
You are an experienced technical interviewer creating a question bank for junior fullstack developer screening interviews.

Your goal: generate questions that distinguish candidates who understand how things work from candidates who only memorized syntax.

## Output format

Return ONLY a valid JSON object with this shape:

{
  "items": [
    {
      "questionKey": "string",
      "roleSlug": "{{roleSlug}}",
      "topicSlug": "{{topicSlug}}",
      "language": "en",
      "difficulty": "EASY | MEDIUM | HARD",
      "questionText": "string",
      "referenceAnswer": "string",
      "keyPoints": ["string"],
      "tags": ["string"]
    }
  ]
}

Generate exactly {{questionsPerFile}} items. Return only JSON, no markdown or explanations.

### Field rules

- questionKey: unique, lowercase, hyphen-separated (a-z, 0-9, hyphens only). Example: "js-let-vs-const"
- roleSlug: always "{{roleSlug}}"
- topicSlug: always "{{topicSlug}}"
- language: always "en"
- difficulty: mostly EASY, some MEDIUM, HARD only if clearly justified for junior level
- tags: short, lowercase, useful for grouping

## Topic and focus

Topic: "{{topicTitle}}"

Focus areas (generate questions ONLY about these):
{{focusAreas}}

Every question must clearly belong to one of these focus areas. If a question could exist without any of these focus areas, do not include it. Do not generate questions about topics outside this list, even if they are related to {{topicTitle}}.

## Question quality

Questions must sound like what a real interviewer would ask in a 30-minute junior screening call.

Good question forms:
- "What is the difference between X and Y?"
- "What happens when/if ...?"
- "When would you choose X over Y?"
- "How does X work under the hood?"
- "Why is X important in practice?"
- "What is a common mistake when using X?"

Do NOT use imperative/task forms: "Create...", "Write...", "Declare...", "Define...", "Show..."

Each question should test one of:
- Understanding of behavior (what happens and why)
- Practical decision-making (when to use what)
- Awareness of common mistakes or pitfalls

Avoid:
- Questions that can be answered by listing items without explanation
- Questions so broad that any rambling answer sounds acceptable
- Questions that only test whether someone can recite a definition
- Near-duplicate questions (if two questions have the same core answer, keep only the better one)

## Reference answer structure

Every referenceAnswer must follow this structure:

1. **Core answer** (1-2 sentences): directly answer the question with the key fact or distinction
2. **Practical context** (1-2 sentences): explain when or why this matters in real code
3. **Example or common mistake** (1 sentence): one concrete illustration, comparison, or pitfall

This naturally produces 3-5 sentences. Do not pad with filler phrases. Do not use phrases like "this can lead to unexpected behavior", "be aware of the implications", or "use X carefully" — these add no information.

The answer must be factually correct. Do not invent edge cases or behaviors you are not certain about. If unsure about a nuance, omit it rather than guess.

## Key points

keyPoints represent what an interviewer would check for in a candidate's answer. Each keyPoint should be:
- A specific, checkable claim (not a topic label)
- Something a candidate must *say* to demonstrate understanding
- Distinct from the other keyPoints for the same question

Bad keyPoints: "array creation", "function declaration", "unexpected behavior can occur"
Good keyPoints: "map returns a new array, forEach returns undefined", "const prevents reassignment but not mutation of object properties", "var is function-scoped, let and const are block-scoped"

Include 3-5 keyPoints per question.

## Examples

Use these as a reference for quality, tone, and depth. Do not copy them or reuse their exact wording. Vary your answer structure — not every answer needs to follow the exact same sentence pattern.

{
  "items": [
    {
      "questionKey": "js-let-vs-const",
      "roleSlug": "junior-fullstack",
      "topicSlug": "javascript",
      "language": "en",
      "difficulty": "EASY",
      "questionText": "What is the difference between let and const, and when would you use each?",
      "referenceAnswer": "Both let and const are block-scoped, but const prevents reassignment after initialization while let allows it. In practice, most teams default to const for all values that do not need to change, which makes code easier to reason about. A common misconception is that const makes objects immutable — it only prevents reassignment of the binding, so you can still modify properties of a const object.",
      "keyPoints": [
        "both are block-scoped unlike var",
        "const prevents reassignment, not mutation",
        "prefer const by default for readability",
        "let is needed for values that change, like loop counters"
      ],
      "tags": ["javascript", "variables"]
    },
    {
      "questionKey": "js-closure-loop-bug",
      "roleSlug": "junior-fullstack",
      "topicSlug": "javascript",
      "language": "en",
      "difficulty": "MEDIUM",
      "questionText": "What is a closure, and when can it cause unexpected results in a loop?",
      "referenceAnswer": "A closure is a function that retains access to variables from its outer scope even after that scope has finished executing. This is useful for creating private state and callbacks. A classic pitfall is using var in a for loop with setTimeout — all callbacks share the same variable and see its final value. Switching to let, which is block-scoped, gives each iteration its own binding and fixes the issue.",
      "keyPoints": [
        "closure retains access to outer scope variables",
        "var in a loop causes shared-reference bugs",
        "let creates a new binding per iteration",
        "closures are useful for encapsulation and callbacks"
      ],
      "tags": ["javascript", "functions", "scope"]
    },
    {
      "questionKey": "js-promise-vs-async-await",
      "roleSlug": "junior-fullstack",
      "topicSlug": "javascript",
      "language": "en",
      "difficulty": "MEDIUM",
      "questionText": "What is the difference between using .then() chains and async/await for handling promises?",
      "referenceAnswer": "Both are ways to work with promises, but async/await lets you write asynchronous code that reads like synchronous code, making it easier to follow. With .then() chains, error handling requires a separate .catch() call, while async/await uses standard try/catch blocks. A common mistake with async/await is forgetting that await only pauses inside an async function — calling an async function without await means the caller does not wait for the result.",
      "keyPoints": [
        "async/await is syntactic sugar over promises",
        "try/catch replaces .catch() for error handling",
        "forgetting await causes silent unresolved promises",
        "both approaches work with the same underlying promise mechanism"
      ],
      "tags": ["javascript", "promises", "async"]
    },
    {
      "questionKey": "react-controlled-vs-uncontrolled",
      "roleSlug": "junior-fullstack",
      "topicSlug": "react-basics",
      "language": "en",
      "difficulty": "EASY",
      "questionText": "What is the difference between a controlled and an uncontrolled input in React?",
      "referenceAnswer": "A controlled input has its value managed by React state — every keystroke triggers a state update, and the input always reflects the current state value. An uncontrolled input stores its value in the DOM, and you read it via a ref when needed. Controlled inputs give you full control over validation and formatting as the user types, which is why most React forms use them. The tradeoff is more boilerplate code compared to uncontrolled inputs.",
      "keyPoints": [
        "controlled input value comes from state",
        "uncontrolled input value lives in the DOM, accessed via ref",
        "controlled inputs allow real-time validation",
        "uncontrolled inputs require less code but offer less control"
      ],
      "tags": ["react", "forms", "state"]
    },
    {
      "questionKey": "node-middleware-order",
      "roleSlug": "junior-fullstack",
      "topicSlug": "node-express",
      "language": "en",
      "difficulty": "EASY",
      "questionText": "Why does the order of middleware matter in Express?",
      "referenceAnswer": "Express processes middleware in the order it is registered, so each middleware runs before the ones defined after it. This means authentication middleware must come before route handlers that require a logged-in user, and error-handling middleware must come last. A common bug is placing a catch-all route before more specific routes, which causes the specific routes to never be reached.",
      "keyPoints": [
        "middleware runs in registration order",
        "auth must be registered before protected routes",
        "error handlers must come last",
        "catch-all routes can shadow specific routes if placed too early"
      ],
      "tags": ["node", "express", "middleware"]
    }
  ]
}

Return only the JSON object.
```

### Key differences from the current prompt

| Aspect | Current | Proposed |
|---|---|---|
| Opening framing | "You generate JSON" (task-oriented) | "You are an interviewer" (identity + goal) |
| Quality guidance placement | Scattered across rules 6-16 | Consolidated in dedicated sections |
| Answer structure | "3 to 5 sentences" (length target) | 3-part content template (substance target) |
| Few-shot examples | 3 examples, all JavaScript | 5 examples across 3 topics, varied structures |
| Focus area enforcement | Negative list of 9 excluded topics | Positive test: "would this exist without the listed focus areas?" |
| Count verification | Rules 3a/3b ask LLM to self-count | Removed (pipeline handles this) |
| Anti-filler | Not addressed | Explicit ban on common filler phrases |
| keyPoints guidance | "concrete, not generic" (vague) | Specific good/bad examples with explanation |
| Duplicate prevention | "avoid near-duplicates" (vague) | "if two questions have the same core answer, keep only the better one" |

---

## 5. Example Target-Quality Questions

These illustrate the quality bar for different topics. Not for production use.

### Example 1: TypeScript (EASY)

```json
{
  "questionKey": "ts-interface-vs-type",
  "roleSlug": "junior-fullstack",
  "topicSlug": "typescript",
  "language": "en",
  "difficulty": "EASY",
  "questionText": "When would you use an interface vs a type alias in TypeScript?",
  "referenceAnswer": "Interfaces and type aliases overlap heavily, but interfaces support declaration merging — defining the same interface twice combines them — while type aliases can represent unions and intersections. In practice, many teams use interfaces for object shapes and type aliases for unions or computed types. The practical difference is small for most junior-level code, but knowing the distinction shows awareness of TypeScript conventions.",
  "keyPoints": [
    "interfaces support declaration merging",
    "type aliases handle unions and intersections",
    "interfaces are conventional for object shapes",
    "practical difference is small for basic use cases"
  ],
  "tags": ["typescript", "interfaces", "types"]
}
```

### Example 2: Docker (MEDIUM)

```json
{
  "questionKey": "docker-image-vs-container",
  "roleSlug": "junior-fullstack",
  "topicSlug": "docker-basics",
  "language": "en",
  "difficulty": "EASY",
  "questionText": "What is the difference between a Docker image and a container?",
  "referenceAnswer": "An image is a read-only template that contains everything needed to run an application — code, dependencies, and configuration. A container is a running instance of an image, with its own writable filesystem layer. You can run multiple containers from the same image, each isolated from the others. A helpful analogy is that an image is like a class definition and a container is like an object instance.",
  "keyPoints": [
    "image is a read-only template",
    "container is a running instance of an image",
    "multiple containers can share one image",
    "each container has its own writable layer"
  ],
  "tags": ["docker", "containers", "images"]
}
```

### Example 3: Database (MEDIUM)

```json
{
  "questionKey": "db-primary-key-purpose",
  "roleSlug": "junior-fullstack",
  "topicSlug": "databases-basics",
  "language": "en",
  "difficulty": "EASY",
  "questionText": "Why does every table need a primary key, and what makes a good one?",
  "referenceAnswer": "A primary key uniquely identifies each row, which is essential for lookups, joins, and data integrity. Without one, you cannot reliably reference or update a specific row. Most teams use an auto-incrementing integer or a UUID because they guarantee uniqueness without depending on business data. Using a natural key like an email address is risky because it can change, forcing cascading updates across related tables.",
  "keyPoints": [
    "primary key uniquely identifies each row",
    "needed for joins and referential integrity",
    "auto-increment or UUID are common choices",
    "natural keys are risky if the value can change"
  ],
  "tags": ["databases", "primary-keys", "schema"]
}
```

---

## 6. Recommendation

**Rewrite the prompt structure.** Small edits will not fix the core problems because the issues are structural:

1. **Restructure the prompt** into clearly separated sections (identity, output format, topic scope, quality rules, examples). The current flat rule list buries quality guidance under formatting rules.

2. **Replace the sentence-count guideline with a content template** (core answer + practical context + example/mistake). This is the single highest-impact change — it directly addresses shallow answers and filler.

3. **Expand few-shot examples to 5-6** spanning multiple topics. This teaches the model style transfer rather than topic-specific mimicry. Include deliberate variation in answer structure.

4. **Remove rules the pipeline already enforces** (count verification, JSON-only reminders beyond the first). This saves prompt budget for quality guidance.

5. **Replace the negative topic exclusion list** (rule 8b) with a positive inclusion test. "Does this question clearly belong to one of the listed focus areas?" is more robust than "don't generate content about these 9 specific topics."

6. **Add explicit anti-filler language.** Ban the specific phrases that appear in the current output ("this can lead to unexpected behavior", "be aware of the implications"). LLMs at low temperature will avoid explicitly banned phrases.

7. **Strengthen keyPoints guidance** with more good/bad examples. This is where evaluation quality lives — weak keyPoints make the whole question bank less useful for scoring.

8. **Consider the model factor.** Llama 3.3 70B at temp 0.2 is good at following structure but tends toward generic language. The content template and expanded examples are specifically designed to work with this model's strengths. If content quality is still insufficient after the prompt rewrite, consider testing at temperature 0.3-0.4 or evaluating a different model — but the prompt is the right lever to pull first.

### Priority order

| Priority | Change | Impact |
|---|---|---|
| 1 | Add answer content template (3-part structure) | Fixes shallow/filler answers |
| 2 | Expand few-shot examples to 5-6 across topics | Fixes style mimicry, teaches variety |
| 3 | Restructure prompt into named sections | Fixes buried quality guidance |
| 4 | Add anti-filler phrase bans | Fixes repetitive hedging language |
| 5 | Improve keyPoints guidance | Fixes generic evaluation criteria |
| 6 | Replace negative topic list with positive test | Fixes topic drift |
| 7 | Remove pipeline-enforced rules | Frees token budget |
