import { readdir } from "node:fs/promises";
import path from "node:path";

const QUESTION_BANK_ROOT = path.join(
  process.cwd(),
  "src",
  "content",
  "question-bank",
);

export async function getAvailableLanguages(): Promise<string[]> {
  const entries = await readdir(QUESTION_BANK_ROOT, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export async function getAvailableTopicsForLanguage(
  language: string,
): Promise<string[]> {
  const languagePath = path.join(QUESTION_BANK_ROOT, language);

  const entries = await readdir(languagePath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name.replace(/\.json$/, ""))
    .sort();
}

export async function getQuestionBankMeta(): Promise<{
  languages: string[];
  topics: string[];
}> {
  const languages = await getAvailableLanguages();

  const topicSet = new Set<string>();

  for (const language of languages) {
    const topics = await getAvailableTopicsForLanguage(language);

    for (const topic of topics) {
      topicSet.add(topic);
    }
  }

  return {
    languages,
    topics: Array.from(topicSet).sort(),
  };
}