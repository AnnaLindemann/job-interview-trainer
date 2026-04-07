# German Translation Prompt Review: generate-de-from-en.md

Date: 2026-04-06

---

## 1. Assessment of the Current DE Prompt

The prompt is a **structural preservation prompt**, not a **localization prompt**. It spends 18 out of 20 rules on JSON integrity (don't add items, don't remove items, don't reorder, preserve keys, preserve slugs) and exactly zero rules on *how* to write good German technical content. The two rules that touch language quality are:

- Rule 9: "Translate questionText into natural, interview-appropriate German."
- Rule 10: "Translate referenceAnswer into clear, technically correct German."

These are aspirational labels, not instructions. They tell the model *what* the output should be but give it no guidance on *how* to get there. The model defaults to literal word-by-word translation, which produces "Schließen" for closure, "Umfang" for scope, and "Versprechen" for promise.

The prompt also says "Translate tags into short lowercase German tags where reasonable" (rule 12) — but gives no criteria for what "reasonable" means, resulting in tags like "umfang" and "versprechen" that are useless for filtering.

**Bottom line:** The prompt protects structure perfectly but completely ignores the actual hard problem — producing natural German developer language.

---

## 2. Five Biggest Weaknesses

### Weakness 1: No terminology policy

This is the root cause of every bad translation in the output. German developers use English terms for most programming concepts. The prompt never tells the model which terms to keep in English. Without this, the model translates everything literally:

| Model produced | Should be | Why |
|---|---|---|
| Schließen | Closure | Universal English term in German dev culture |
| Umfang | Scope | "Umfang" = circumference. Developers say "Scope" |
| Versprechen | Promise | No one says "Versprechen" in JS context |
| Variable-Heben | Hoisting | English term is standard |
| Erbschaft | Vererbung | "Erbschaft" = inheriting money. Programming = "Vererbung" |
| Kette von Versprechen | Promise Chaining | Literal translation of both words |

The fix is not "translate better" — it's "don't translate these at all."

### Weakness 2: No German grammar guidance

German has specific challenges that LLMs frequently get wrong:

- **Compound nouns** require a Fugen-s or Fugen-n: "Funktionsdeklaration" not "Funktiondeklaration", "Methodenverkettung" not "Methodekette"
- **Article and case agreement**: "asynchrone**n** Code" (Akkusativ), "eine**n** einzelne**n** Wert" — the output has these wrong
- **Noun gender**: "das Array" (neuter) not "die Array" — the output uses "eine neue Array" (feminine) which is wrong

The prompt says nothing about these. A single sentence like "Pay attention to German compound noun rules (Fugenlaute) and correct grammatical cases" would help.

### Weakness 3: No definition of "natural German" for a technical context

Rule 9 says "natural, interview-appropriate German" but German technical interviews have a specific register: formal but practical, using English terms for concepts and German for explanation flow. The model doesn't know this. It either:
- Translates everything (producing alien German), or
- Would need explicit guidance on the register

A German interviewer would ask: "Was ist eine Closure und wann kann sie zu Problemen führen?" — not "Wie funktioniert ein Schließen in JavaScript?"

### Weakness 4: No examples of correct German output

The EN prompt has 3 few-shot examples that strongly guide quality. The DE prompt has zero. For translation quality, examples are even more critical because they show the model the exact register, terminology choices, and style expected. One good EN→DE example pair would prevent most of the terminology problems.

### Weakness 5: Tag translation rule is counterproductive

Rule 12 says "Translate tags into short lowercase German tags where reasonable." This produced tags like `"umfang"`, `"versprechen"`, `"funktionen"`, `"ausdrücke"`. These are:
- Not useful for filtering (mixed language tags break consistency)
- Not recognizable (a developer searching for scope-related questions won't type "umfang")
- Inconsistent (some tags stay English, some don't, based on the model's arbitrary judgment of "reasonable")

Tags should stay in English. They're machine-readable identifiers, not user-facing prose.

---

## 3. Concrete Improvements

| Problem | Current prompt | Fix |
|---|---|---|
| No terminology policy | (absent) | Add explicit list of terms that must stay in English |
| No grammar guidance | (absent) | Add rules for compound nouns, article gender, grammatical case |
| "Natural German" undefined | "translate into natural German" | Define the register: German explanation flow + English technical terms |
| No examples | (absent) | Add 2 EN→DE example pairs showing correct translation |
| Tags translated | "translate tags where reasonable" | Change to: keep all tags in English |
| 18 structural rules | Rules 1-8, 13-20 | Consolidate to ~5 rules (same protection, less noise) |
| No quality bar for answers | (absent) | Add: answers must read as if written by a German senior developer |

---

## 4. Proposed Revised Prompt: generate-de-from-en.md

```markdown
You are a senior German-speaking fullstack developer localizing an English interview question bank into German.

Your goal: produce a German version that sounds like it was written by a native German developer for a real technical interview — not like a machine-translated document.

## Output format

Return ONLY a valid JSON object with this shape:

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

Return only JSON. No markdown. No explanations.

## Structural rules

- Preserve the exact number of items, order, questionKey, roleSlug, topicSlug, and difficulty from the English source.
- Set language = "de" for every item.
- Keep tags in English (do not translate tags).
- Do not add, remove, merge, split, or reorder items.

## Terminology policy

German developers use English terms for most programming concepts. Do NOT translate the following terms — keep them in English exactly as they appear:

Closure, Scope, Hoisting, Promise, Callback, Event Loop, Prototype, Middleware, Hook, State, Props, Component, Rendering, Ref, Effect, Router, Endpoint, Request, Response, Header, Token, Session, Query, Migration, Container, Image, Branch, Merge, Commit, Deploy, Pipeline, Type, Interface, Generics, Assertion, Mock, Stub, Runtime, Framework, Library, Arrow Function, Spread Operator, Destructuring, Template Literal, Async/Await, Chaining, Memoization

When in doubt about a technical term: if a German developer would use the English word in conversation, keep it in English.

## German language rules

1. Write in the register of a German technical interview: professional, clear, practical. Use German sentence structure and explanation flow, but keep technical terms in English.

2. Follow German compound noun rules (Fugenlaute):
   - "Funktionsdeklaration" (not "Funktiondeklaration")
   - "Funktionsausdruck" (not "Funktionausdruck")
   - "Methodenverkettung" (not "Methodekette")
   - "Standardwert" (not "Defaultwert")

3. Use correct grammatical gender for technical nouns:
   - das Array (neuter)
   - die Funktion (feminine)
   - der Callback (masculine)
   - das Promise (neuter)
   - die Closure (feminine)
   - der Scope (masculine)

4. Pay attention to grammatical case (Akkusativ, Dativ) in article and adjective endings:
   - "einen neuen Wert" (not "ein einzelnes Wert")
   - "asynchronen Code" (not "asynchrone Code")

5. Prefer active voice over passive constructions where natural.

6. Use "du" (informal you) for question phrasing, matching the conversational interview tone:
   - "Wie würdest du erklären, was eine Closure ist?"
   - "Was passiert, wenn ein Promise rejected wird?"

## Translation quality

- questionText should sound like what a German interviewer would actually say out loud.
- referenceAnswer must preserve all technical accuracy and depth from the English source. Do not simplify or shorten the English answer — translate the full meaning, including examples and nuances.
- keyPoints should be concise German phrases using English technical terms where appropriate.
- If the English answer mentions a code pattern or concrete example, keep it in the German version.

## Examples

English source:
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
}

Correct German translation:
{
  "questionKey": "js-closure-loop-bug",
  "roleSlug": "junior-fullstack",
  "topicSlug": "javascript",
  "language": "de",
  "difficulty": "MEDIUM",
  "questionText": "Was ist eine Closure, und wann kann sie in einer Schleife zu unerwarteten Ergebnissen führen?",
  "referenceAnswer": "Eine Closure ist eine Funktion, die Zugriff auf Variablen aus ihrem äußeren Scope behält, auch nachdem dieser Scope fertig ausgeführt wurde. Das ist nützlich, um privaten State und Callbacks zu erstellen. Ein klassisches Problem entsteht, wenn man var in einer for-Schleife mit setTimeout verwendet — alle Callbacks teilen sich dieselbe Variable und sehen deren Endwert. Mit let, das block-scoped ist, bekommt jede Iteration eine eigene Bindung, und das Problem ist gelöst.",
  "keyPoints": [
    "Closure behält Zugriff auf Variablen aus dem äußeren Scope",
    "var in einer Schleife verursacht Shared-Reference-Bugs",
    "let erzeugt pro Iteration eine neue Bindung",
    "Closures sind nützlich für Kapselung und Callbacks"
  ],
  "tags": ["javascript", "functions", "scope"]
}

English source:
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
}

Correct German translation:
{
  "questionKey": "js-promise-vs-async-await",
  "roleSlug": "junior-fullstack",
  "topicSlug": "javascript",
  "language": "de",
  "difficulty": "MEDIUM",
  "questionText": "Was ist der Unterschied zwischen .then()-Chains und async/await beim Arbeiten mit Promises?",
  "referenceAnswer": "Beide Ansätze arbeiten mit Promises, aber async/await ermöglicht es, asynchronen Code zu schreiben, der sich wie synchroner Code liest und dadurch leichter nachvollziehbar ist. Bei .then()-Chains braucht man einen separaten .catch()-Aufruf für die Fehlerbehandlung, während async/await mit normalen try/catch-Blöcken arbeitet. Ein häufiger Fehler bei async/await ist, zu vergessen, dass await nur innerhalb einer async-Funktion pausiert — ruft man eine async-Funktion ohne await auf, wartet der Aufrufer nicht auf das Ergebnis.",
  "keyPoints": [
    "async/await ist syntaktischer Zucker über Promises",
    "try/catch ersetzt .catch() für die Fehlerbehandlung",
    "vergessenes await führt zu stillen unaufgelösten Promises",
    "beide Ansätze nutzen denselben zugrundeliegenden Promise-Mechanismus"
  ],
  "tags": ["javascript", "promises", "async"]
}

Use these examples as a reference for terminology, register, and quality. Do not copy their wording for other questions.

## English source JSON

{{englishSourceJson}}

Return only the JSON object.
```

---

## 5. Terminology Policy for German Technical Content

### Core principle

**Use English for concepts, use German for explanations.**

A German developer says: "Die Closure behält den Zugriff auf den äußeren Scope" — not "Das Schließen behält den Zugriff auf den äußeren Umfang."

### Three categories

**Category 1: Always keep in English**
These terms are never translated in German developer communication:

> Closure, Scope, Hoisting, Promise, Callback, Event Loop, Prototype, Middleware, Hook, State, Props, Component, Rendering, Ref, Effect, Router, Endpoint, Request, Response, Header, Token, Session, Query, Migration, Container, Image, Branch, Merge, Commit, Deploy, Pipeline, Type, Interface, Generics, Mock, Stub, Runtime, Framework, Library, Arrow Function, Spread Operator, Destructuring, Template Literal, Async/Await, Chaining

**Category 2: German equivalent exists and is commonly used**
These have established German translations that developers actually use:

| English | German |
|---|---|
| variable | Variable |
| function | Funktion |
| loop | Schleife |
| condition | Bedingung |
| inheritance (OOP) | Vererbung |
| assignment | Zuweisung |
| return value | Rückgabewert |
| default value | Standardwert |
| error handling | Fehlerbehandlung |
| data type | Datentyp |
| parameter | Parameter |
| property | Eigenschaft |
| encapsulation | Kapselung |
| block-scoped | block-scoped (hybrid: German article, English adjective) |

**Category 3: Use English term with German article/grammar**

When using English terms in German sentences, assign a German article and decline normally:

| Term | Gender | Example |
|---|---|---|
| das Array | neuter | "ein neues Array" |
| die Closure | feminine | "eine Closure erstellen" |
| das Promise | neuter | "das Promise wird resolved" |
| der Scope | masculine | "im äußeren Scope" |
| der Callback | masculine | "den Callback aufrufen" |
| das Interface | neuter | "ein Interface definieren" |
| die Component | feminine | "eine React Component" |
| der Hook | masculine | "der useEffect-Hook" |

### Tags

Tags stay in English always. They are identifiers, not prose.
