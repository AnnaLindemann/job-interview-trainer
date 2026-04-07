import { readFile } from "node:fs/promises";
import path from "node:path";

import type { TopicConfig } from "../config/config.schema";
import type { QuestionBankItems } from "../schemas/question-bank";

type BuildEnglishPromptParams = {
  topic: TopicConfig;
  questionsPerFile: number;
};

type BuildGermanPromptParams = {
  englishItems: QuestionBankItems;
};

type BuildEnglishReviewPromptParams = {
  topic: TopicConfig;
  existingEnglishItems: QuestionBankItems;
};

type BuildGermanReviewPromptParams = {
  topic: TopicConfig;
  existingEnglishItems: QuestionBankItems;
  existingGermanItems: QuestionBankItems;
};

const PROMPTS_DIR = path.resolve(
  process.cwd(),
  "tools/question-bank-generator/prompts"
);

function replacePlaceholder(template: string, key: string, value: string): string {
  return template.replaceAll(`{{${key}}}`, value);
}

function formatFocusAreas(focusAreas: string[]): string {
  return focusAreas.map((area) => `- ${area}`).join("\n");
}

async function readPromptTemplate(fileName: string): Promise<string> {
  const templatePath = path.join(PROMPTS_DIR, fileName);
  return readFile(templatePath, "utf-8");
}

export async function buildEnglishPrompt(
  params: BuildEnglishPromptParams
): Promise<string> {
  const template = await readPromptTemplate("generate-en.md");

  let prompt = template;

  prompt = replacePlaceholder(
    prompt,
    "questionsPerFile",
    String(params.questionsPerFile)
  );
  prompt = replacePlaceholder(prompt, "roleSlug", params.topic.roleSlug);
  prompt = replacePlaceholder(prompt, "topicSlug", params.topic.slug);
  prompt = replacePlaceholder(prompt, "topicTitle", params.topic.title);
  prompt = replacePlaceholder(
    prompt,
    "focusAreas",
    formatFocusAreas(params.topic.focusAreas)
  );

  return prompt;
}

export async function buildGermanPromptFromEnglish(
  params: BuildGermanPromptParams
): Promise<string> {
  const template = await readPromptTemplate("generate-de-from-en.md");

  return replacePlaceholder(
    template,
    "englishSourceJson",
    JSON.stringify({ items: params.englishItems }, null, 2)
  );
}

export async function buildEnglishReviewPrompt(
  params: BuildEnglishReviewPromptParams
): Promise<string> {
  const template = await readPromptTemplate("review-fix-en.md");

  let prompt = template;

  prompt = replacePlaceholder(prompt, "roleSlug", params.topic.roleSlug);
  prompt = replacePlaceholder(prompt, "topicSlug", params.topic.slug);
  prompt = replacePlaceholder(prompt, "topicTitle", params.topic.title);
  prompt = replacePlaceholder(
    prompt,
    "focusAreas",
    formatFocusAreas(params.topic.focusAreas)
  );
  prompt = replacePlaceholder(
    prompt,
    "existingEnglishJson",
    JSON.stringify({ items: params.existingEnglishItems }, null, 2)
  );

  return prompt;
}

export async function buildGermanReviewPrompt(
  params: BuildGermanReviewPromptParams
): Promise<string> {
  const template = await readPromptTemplate("review-fix-de.md");

  let prompt = template;

  prompt = replacePlaceholder(prompt, "roleSlug", params.topic.roleSlug);
  prompt = replacePlaceholder(prompt, "topicSlug", params.topic.slug);
  prompt = replacePlaceholder(prompt, "topicTitle", params.topic.title);
  prompt = replacePlaceholder(
    prompt,
    "existingEnglishJson",
    JSON.stringify({ items: params.existingEnglishItems }, null, 2)
  );
  prompt = replacePlaceholder(
    prompt,
    "existingGermanJson",
    JSON.stringify({ items: params.existingGermanItems }, null, 2)
  );

  return prompt;
}