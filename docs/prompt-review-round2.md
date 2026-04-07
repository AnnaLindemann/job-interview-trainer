# Prompt Review — Round 2

Date: 2026-04-06
Files reviewed:
- `tools/question-bank-generator/prompts/generate-en.md`
- `tools/question-bank-generator/prompts/generate-de-from-en.md`
- `tools/question-bank-generator/config/generator.config.json`

---

## Critical finding outside prompt scope

The model was changed from `llama-3.3-70b-versatile` to `llama-3.1-8b-instant`. This is a drop from 70B parameters to 8B. No prompt improvement will compensate for this. An 8B model at temperature 0.2 will produce more formulaic, less accurate, and shallower content than a 70B model — regardless of prompt quality. This single config change undermines every prompt improvement made so far.

**This is not a prompt problem, but it is the #1 risk to output quality.**

---

## EN Prompt: Remaining Weaknesses

### What improved (credit where due)

- Identity framing ("experienced technical interviewer") — good
- 3-part answer structure (core + practical context + example/mistake) — the highest-impact change, correctly implemented
- Explicit filler phrase bans — targeted and useful
- keyPoints good/bad examples — concrete and helpful
- Duplicate rule ("same core answer → keep only one") — actionable
- Topic discipline tightened — clear

### Weakness 1: Only one example, and it's off-topic

The prompt has a single example (`example-state-vs-ref`) about state vs refs. This is a frontend/React question, but the prompt generates questions for *any* topic (Docker, databases, Git, auth, etc.). Problems:

- **One example is not enough for style calibration.** With Llama 8B at low temperature, the model will either over-mimic the single example's sentence patterns or ignore it because it doesn't match the current topic.
- **The example's topic doesn't match most generations.** When generating Docker or database questions, the model has no reference for what a good answer looks like in those domains.

**Fix:** Add 2 more examples from different domains (one backend/infrastructure, one broader JS). Three varied examples is the minimum for reliable style transfer. Keep them short — each adds ~100 tokens.

### Weakness 2: The 3-part answer structure has no enforcement mechanism

Rule 9 says each answer MUST include:
1. Core answer
2. Practical context
3. One concrete example OR real mistake

But the model sees this as a suggestion, not a structural constraint. With an 8B model, it will often collapse parts 2 and 3 into a single vague sentence or skip the concrete example entirely.

**Fix:** Make the structure visible in the example. Add a brief inline annotation:

```
"referenceAnswer": "[Core] State is used for values that affect rendering, while a ref stores a mutable value without causing a re-render. [Practical] In practice, state is for UI data like form values, while refs are for DOM access or storing previous values. [Example] A common mistake is putting non-visual mutable data into state, causing unnecessary re-renders."
```

Then add: "Do not include the [Core], [Practical], [Example] labels in your output — they are shown here only to illustrate the required structure."

This is a known technique for weaker models: showing the structure annotated in examples makes them internalize it, even after you tell them not to include the labels.

**Alternative (simpler):** If annotated examples feel too fragile, add one sentence: "The example or mistake MUST be concrete and specific to the topic — not a generic warning. If the answer does not contain a specific scenario, code behavior, or named pitfall, it is incomplete."

### Weakness 3: No guard against factual hallucination from the 8B model

Rule 9 says "no speculation or guessing / if unsure → omit the detail." This is good guidance for a 70B model that can somewhat gauge its own confidence. An 8B model is worse at self-assessment — it will confidently state things that are wrong (as we saw with "const silently fails in non-strict mode").

**Fix:** Add to rule 9: "Do not describe edge-case behaviors unless you are certain they are correct. Prefer explaining the standard, well-known behavior thoroughly over mentioning obscure edge cases that may be inaccurate."

This nudges the model away from inventing "interesting" edge cases (which is where most factual errors come from) and toward covering the basics well.

### Minor issues (low priority)

- **"Quality bar" section at the end** repeats rules 6, 7, 9 in weaker language. It's harmless but adds 3 lines of noise. Could be cut.
- **Rule 7 says "no duplicates"** but doesn't define what counts as a duplicate. Two questions can have different wording but test the same knowledge. Consider: "Two questions are duplicates if a strong answer to one would fully answer the other."
- **Difficulty distribution** ("mostly EASY, some MEDIUM") is vague enough that the model could produce 9 EASY + 1 MEDIUM or 5 EASY + 5 MEDIUM. If the ratio matters, specify it (e.g., "60% EASY, 30% MEDIUM, 10% HARD").

---

## DE Prompt: Remaining Weaknesses

### What improved

- Terminology list with explicit "keep in English" terms — the most important fix, correctly done
- Tags stay in English — fixed
- "Avoid literal word-by-word translation" — good explicit instruction
- Quality expectations section — preserves depth from English source

### Weakness 1: No examples

The EN prompt has one example. The DE prompt has zero. For a *translation* task, examples are the single most effective lever. The model needs to see what "natural German with English terms" actually looks like in practice — not just be told about it.

**Fix:** Add one EN→DE example pair. This is the highest-impact change for the DE prompt. A single good pair that demonstrates:
- Keeping "Closure", "Scope", "Promise" in English
- Natural German sentence flow
- Correct compound nouns
- Correct grammatical gender and case

Example:

```
English source:
{
  "questionKey": "example-closure-scope",
  "questionText": "What is a closure, and when can it cause unexpected results in a loop?",
  "referenceAnswer": "A closure is a function that retains access to variables from its outer scope even after that scope has finished executing. This is useful for creating private state and callbacks. A classic pitfall is using var in a for loop with setTimeout — all callbacks share the same variable and see its final value. Switching to let, which is block-scoped, gives each iteration its own binding and fixes the issue.",
  "keyPoints": [
    "closure retains access to outer scope variables",
    "var in a loop causes shared-reference bugs",
    "let creates a new binding per iteration",
    "closures are useful for encapsulation and callbacks"
  ]
}

German translation:
{
  "questionKey": "example-closure-scope",
  "questionText": "Was ist eine Closure, und wann kann sie in einer Schleife zu unerwarteten Ergebnissen führen?",
  "referenceAnswer": "Eine Closure ist eine Funktion, die Zugriff auf Variablen aus ihrem äußeren Scope behält, auch nachdem dieser Scope fertig ausgeführt wurde. Das ist nützlich, um privaten State und Callbacks zu erstellen. Ein klassisches Problem entsteht, wenn man var in einer for-Schleife mit setTimeout verwendet — alle Callbacks teilen sich dieselbe Variable und sehen deren Endwert. Mit let, das block-scoped ist, bekommt jede Iteration eine eigene Bindung, und das Problem ist gelöst.",
  "keyPoints": [
    "Closure behält Zugriff auf Variablen aus dem äußeren Scope",
    "var in einer Schleife verursacht Shared-Reference-Bugs",
    "let erzeugt pro Iteration eine neue Bindung",
    "Closures sind nützlich für Kapselung und Callbacks"
  ]
}
```

Add: "Use this example as reference for terminology choices and German sentence style. Do not copy its wording."

### Weakness 2: "Prefer 'man' over 'du'" contradicts natural interview tone

Rule 57 says: "Prefer 'man' over 'du' unless direct address clearly sounds more natural."

In real German tech interviews, both forms exist, but "man" used consistently produces a textbook feel ("Man verwendet let, wenn man eine Variable verändern möchte..."). Real German interviewers mix both, but leaning toward "du" for question phrasing sounds more natural:

- "Was passiert, wenn du ein Promise ohne await aufrufst?" (natural)
- "Was passiert, wenn man ein Promise ohne await aufruft?" (textbook)

For *answers*, "man" is fine since it's explanatory. But for *questions*, "du" is more interview-like.

**Fix:** Change to: "For questionText, prefer 'du' for direct, conversational interview tone. For referenceAnswer, 'man' is acceptable for general explanations."

### Weakness 3: Compound noun and gender rules are mentioned but not demonstrated

The style rules say "Grammar rules (gender, cases, compound nouns) are important" but provide no examples of correct vs incorrect German. Without examples, the model doesn't know what a Fugen-s error looks like.

**Fix:** Add 3 inline corrections to the terminology or style section:

```
Common German grammar issues to avoid:
- "Funktionsdeklaration" (correct) — not "Funktiondeklaration" (missing Fugen-s)
- "das Array" (neuter) — not "die Array"
- "asynchronen Code verarbeiten" (Akkusativ) — not "asynchrone Code verarbeiten"
```

This costs 3 lines and prevents the most frequent grammar errors seen in previous output.

### Weakness 4: Terminology list may not cover all topics

The keep-in-English list covers JS and React terms well but may be thin for some topics:

- **Docker**: Container, Image are listed? Yes (from the config context these exist). But what about Volume, Layer, Build, Registry, Port Mapping?
- **Git**: Branch, Merge, Commit are covered. But Rebase, Cherry-pick, Stash, Pull Request?
- **Database**: Query, Migration are listed. But Join, Index, Schema, Foreign Key, Constraint?
- **Auth**: Token, Session are listed. But Hash, Salt, OAuth, JWT, CORS?

**Fix:** Either expand the list to cover all 14 topics, or strengthen the fallback rule. Current fallback: "Prefer keeping it in English." This is actually good — it means the model defaults to English for unlisted terms. The risk is low. If you want extra safety, add: "For any term commonly used in English in German Stack Overflow answers or documentation, keep it in English."

---

## 3 Highest-Impact Fixes

### 1. Add one EN→DE example pair to the DE prompt
**Why:** Zero examples = zero style calibration. One pair showing correct terminology, gender, compound nouns, and natural flow will prevent the majority of translation errors. This is a 15-line addition that fixes the most visible quality problems.

### 2. Add 2 more examples to the EN prompt (different topics)
**Why:** A single React example doesn't teach the model how to write good answers about databases, Docker, or Git. With an 8B model, examples are the primary quality lever — rules are secondary. Three examples across different domains give the model style transfer capability.

### 3. Address the model downgrade (outside prompt scope)
**Why:** The config now uses `llama-3.1-8b-instant` instead of `llama-3.3-70b-versatile`. This 8B model will produce measurably worse content regardless of prompt quality. If the switch was intentional (cost/speed), the prompt changes above become even more critical. If it was accidental, reverting it is the single highest-ROI change. No prompt can fully compensate for a 9x parameter reduction.

---

## Summary

| Priority | Prompt | Fix | Effort |
|---|---|---|---|
| 1 | DE | Add one EN→DE example pair | ~15 lines |
| 2 | EN | Add 2 more examples (different topics) | ~30 lines |
| 3 | config | Verify model choice is intentional (8B vs 70B) | 1 line |
| 4 | EN | Strengthen concrete-example enforcement in rule 9 | 2 sentences |
| 5 | DE | Fix "man" vs "du" guidance for questions vs answers | 1 sentence |
| 6 | DE | Add 3 inline compound noun / gender corrections | 3 lines |
