import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

import { access } from "node:fs/promises";
import path from "node:path";

import {
  buildEnglishPrompt,
  buildEnglishReviewPrompt,
  buildGermanPromptFromEnglish,
  buildGermanReviewPrompt,
} from "./lib/build-prompts";
import { loadConfig } from "./lib/load-config";
import { generateJsonWithGroq } from "./lib/llm-client";
import { logError, logInfo, logSuccess, logWarn } from "./lib/logger";
import { parseQuestionBankResponse } from "./lib/parse-question-bank";
import { validateEnglishItems, validateGermanItems } from "./lib/validate";
import { writeJsonFile } from "./lib/write-json";

type ParsedItems = ReturnType<typeof parseQuestionBankResponse>["items"];

type GeneratedLanguageResult = {
  rawContent: string;
  finishReason: string | null;
  parsedItems: ParsedItems;
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(path.resolve(process.cwd(), filePath));
    return true;
  } catch {
    return false;
  }
}

function isCountMismatchError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("item count mismatch");
}

async function saveDebugFile(params: {
  topicSlug: string;
  stage: "generate-en" | "review-en" | "generate-de" | "review-de";
  attempt: number;
  finishReason: string | null;
  rawContent: string;
  parsedItems?: ParsedItems;
  errorMessage: string;
}): Promise<void> {
  const debugFilePath = path.join(
    "tmp/question-bank-debug",
    `${params.topicSlug}.${params.stage}.attempt-${params.attempt}.json`
  );

  await writeJsonFile({
    filePath: debugFilePath,
    data: {
      topicSlug: params.topicSlug,
      stage: params.stage,
      attempt: params.attempt,
      finishReason: params.finishReason,
      errorMessage: params.errorMessage,
      rawContentLength: params.rawContent.length,
      rawContent: params.rawContent,
      parsedCount: params.parsedItems?.length ?? null,
      parsedItems: params.parsedItems ?? null,
    },
  });

  logWarn(`Saved debug file: ${debugFilePath}`);
}

async function generateEnglishWithRetries(params: {
  topic: Awaited<ReturnType<typeof loadConfig>>["topics"][number];
  model: string;
  temperature: number;
  questionsPerFile: number;
  maxRetries: number;
}): Promise<GeneratedLanguageResult> {
  const prompt = await buildEnglishPrompt({
    topic: params.topic,
    questionsPerFile: params.questionsPerFile,
  });

  const totalAttempts = params.maxRetries + 1;

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    logInfo(
      `Generating English question bank for "${params.topic.slug}" (attempt ${attempt}/${totalAttempts})`
    );

    const result = await generateJsonWithGroq({
      prompt,
      model: params.model,
      temperature: params.temperature,
    });

    logInfo(
      `English raw content length for "${params.topic.slug}": ${result.content.length}`
    );
    logInfo(
      `English finish reason for "${params.topic.slug}": ${result.finishReason ?? "unknown"}`
    );

    let parsed: ReturnType<typeof parseQuestionBankResponse> | undefined;

    try {
      parsed = parseQuestionBankResponse(result.content);

      logInfo(
        `English parsed item count for "${params.topic.slug}": ${parsed.items.length}`
      );

      validateEnglishItems({
        items: parsed.items,
        expectedCount: params.questionsPerFile,
        topicSlug: params.topic.slug,
      });

      logSuccess(`English generation validation passed for "${params.topic.slug}"`);

      return {
        rawContent: result.content,
        finishReason: result.finishReason,
        parsedItems: parsed.items,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown English generation error";

      await saveDebugFile({
        topicSlug: params.topic.slug,
        stage: "generate-en",
        attempt,
        finishReason: result.finishReason,
        rawContent: result.content,
        parsedItems: parsed?.items,
        errorMessage: message,
      });

      if (attempt < totalAttempts && isCountMismatchError(error)) {
        logWarn(
          `English generation retry for "${params.topic.slug}" because of count mismatch: ${message}`
        );
        continue;
      }

      throw error;
    }
  }

  throw new Error(`English generation failed for "${params.topic.slug}"`);
}

async function reviewEnglishWithRetries(params: {
  topic: Awaited<ReturnType<typeof loadConfig>>["topics"][number];
  englishItems: ParsedItems;
  model: string;
  temperature: number;
  maxRetries: number;
}): Promise<GeneratedLanguageResult> {
  const prompt = await buildEnglishReviewPrompt({
    topic: params.topic,
    existingEnglishItems: params.englishItems,
  });

  const totalAttempts = params.maxRetries + 1;

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    logInfo(
      `Reviewing English question bank for "${params.topic.slug}" (attempt ${attempt}/${totalAttempts})`
    );

    const result = await generateJsonWithGroq({
      prompt,
      model: params.model,
      temperature: params.temperature,
    });

    logInfo(
      `English review raw content length for "${params.topic.slug}": ${result.content.length}`
    );
    logInfo(
      `English review finish reason for "${params.topic.slug}": ${result.finishReason ?? "unknown"}`
    );

    let parsed: ReturnType<typeof parseQuestionBankResponse> | undefined;

    try {
      parsed = parseQuestionBankResponse(result.content);

      logInfo(
        `English review parsed item count for "${params.topic.slug}": ${parsed.items.length}`
      );

      validateEnglishItems({
        items: parsed.items,
        expectedCount: params.englishItems.length,
        topicSlug: params.topic.slug,
      });

      logSuccess(`English review validation passed for "${params.topic.slug}"`);

      return {
        rawContent: result.content,
        finishReason: result.finishReason,
        parsedItems: parsed.items,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown English review error";

      await saveDebugFile({
        topicSlug: params.topic.slug,
        stage: "review-en",
        attempt,
        finishReason: result.finishReason,
        rawContent: result.content,
        parsedItems: parsed?.items,
        errorMessage: message,
      });

      if (attempt < totalAttempts && isCountMismatchError(error)) {
        logWarn(
          `English review retry for "${params.topic.slug}" because of count mismatch: ${message}`
        );
        continue;
      }

      throw error;
    }
  }

  throw new Error(`English review failed for "${params.topic.slug}"`);
}

async function generateGermanWithRetries(params: {
  topicSlug: string;
  englishItems: ParsedItems;
  model: string;
  temperature: number;
  maxRetries: number;
}): Promise<GeneratedLanguageResult> {
  const prompt = await buildGermanPromptFromEnglish({
    englishItems: params.englishItems,
  });

  const totalAttempts = params.maxRetries + 1;

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    logInfo(
      `Generating German question bank for "${params.topicSlug}" (attempt ${attempt}/${totalAttempts})`
    );

    const result = await generateJsonWithGroq({
      prompt,
      model: params.model,
      temperature: params.temperature,
    });

    logInfo(
      `German raw content length for "${params.topicSlug}": ${result.content.length}`
    );
    logInfo(
      `German finish reason for "${params.topicSlug}": ${result.finishReason ?? "unknown"}`
    );

    let parsed: ReturnType<typeof parseQuestionBankResponse> | undefined;

    try {
      parsed = parseQuestionBankResponse(result.content);

      logInfo(
        `German parsed item count for "${params.topicSlug}": ${parsed.items.length}`
      );

      validateGermanItems({
        englishItems: params.englishItems,
        germanItems: parsed.items,
        topicSlug: params.topicSlug,
      });

      logSuccess(`German generation validation passed for "${params.topicSlug}"`);

      return {
        rawContent: result.content,
        finishReason: result.finishReason,
        parsedItems: parsed.items,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown German generation error";

      await saveDebugFile({
        topicSlug: params.topicSlug,
        stage: "generate-de",
        attempt,
        finishReason: result.finishReason,
        rawContent: result.content,
        parsedItems: parsed?.items,
        errorMessage: message,
      });

      if (attempt < totalAttempts && isCountMismatchError(error)) {
        logWarn(
          `German generation retry for "${params.topicSlug}" because of count mismatch: ${message}`
        );
        continue;
      }

      throw error;
    }
  }

  throw new Error(`German generation failed for "${params.topicSlug}"`);
}

async function reviewGermanWithRetries(params: {
  topic: Awaited<ReturnType<typeof loadConfig>>["topics"][number];
  englishItems: ParsedItems;
  germanItems: ParsedItems;
  model: string;
  temperature: number;
  maxRetries: number;
}): Promise<GeneratedLanguageResult> {
  const prompt = await buildGermanReviewPrompt({
    topic: params.topic,
    existingEnglishItems: params.englishItems,
    existingGermanItems: params.germanItems,
  });

  const totalAttempts = params.maxRetries + 1;

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    logInfo(
      `Reviewing German question bank for "${params.topic.slug}" (attempt ${attempt}/${totalAttempts})`
    );

    const result = await generateJsonWithGroq({
      prompt,
      model: params.model,
      temperature: params.temperature,
    });

    logInfo(
      `German review raw content length for "${params.topic.slug}": ${result.content.length}`
    );
    logInfo(
      `German review finish reason for "${params.topic.slug}": ${result.finishReason ?? "unknown"}`
    );

    let parsed: ReturnType<typeof parseQuestionBankResponse> | undefined;

    try {
      parsed = parseQuestionBankResponse(result.content);

      logInfo(
        `German review parsed item count for "${params.topic.slug}": ${parsed.items.length}`
      );

      validateGermanItems({
        englishItems: params.englishItems,
        germanItems: parsed.items,
        topicSlug: params.topic.slug,
      });

      logSuccess(`German review validation passed for "${params.topic.slug}"`);

      return {
        rawContent: result.content,
        finishReason: result.finishReason,
        parsedItems: parsed.items,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown German review error";

      await saveDebugFile({
        topicSlug: params.topic.slug,
        stage: "review-de",
        attempt,
        finishReason: result.finishReason,
        rawContent: result.content,
        parsedItems: parsed?.items,
        errorMessage: message,
      });

      if (attempt < totalAttempts && isCountMismatchError(error)) {
        logWarn(
          `German review retry for "${params.topic.slug}" because of count mismatch: ${message}`
        );
        continue;
      }

      throw error;
    }
  }

  throw new Error(`German review failed for "${params.topic.slug}"`);
}

async function generateQuestionBank(): Promise<void> {
  const config = await loadConfig();

  logInfo(`Loaded config for ${config.topics.length} topics`);

  for (const topic of config.topics) {
    const englishFilePath = path.join(config.output.enDir, `${topic.slug}.json`);
    const germanFilePath = path.join(config.output.deDir, `${topic.slug}.json`);

    logInfo(`Starting topic: ${topic.slug}`);

    const englishFileExists = await fileExists(englishFilePath);
    const germanFileExists = await fileExists(germanFilePath);

    if (!config.defaults.overwrite && (englishFileExists || germanFileExists)) {
      logWarn(
        `Skipping "${topic.slug}" because output file already exists and overwrite=false`
      );
      logInfo(`EN: ${englishFilePath}`);
      logInfo(`DE: ${germanFilePath}`);
      continue;
    }

    try {
      const englishGenerated = await generateEnglishWithRetries({
        topic,
        model: config.model,
        temperature: config.defaults.temperature,
        questionsPerFile: config.defaults.questionsPerFile,
        maxRetries: config.defaults.maxRetries,
      });

      const englishReviewed = await reviewEnglishWithRetries({
        topic,
        englishItems: englishGenerated.parsedItems,
        model: config.model,
        temperature: config.defaults.temperature,
        maxRetries: config.defaults.maxRetries,
      });

      const germanGenerated = await generateGermanWithRetries({
        topicSlug: topic.slug,
        englishItems: englishReviewed.parsedItems,
        model: config.model,
        temperature: config.defaults.temperature,
        maxRetries: config.defaults.maxRetries,
      });

      const germanReviewed = await reviewGermanWithRetries({
        topic,
        englishItems: englishReviewed.parsedItems,
        germanItems: germanGenerated.parsedItems,
        model: config.model,
        temperature: config.defaults.temperature,
        maxRetries: config.defaults.maxRetries,
      });

      await writeJsonFile({
        filePath: englishFilePath,
        data: englishReviewed.parsedItems,
      });

      await writeJsonFile({
        filePath: germanFilePath,
        data: germanReviewed.parsedItems,
      });

      logSuccess(`Saved reviewed files for "${topic.slug}"`);
      logInfo(`EN: ${englishFilePath}`);
      logInfo(`DE: ${germanFilePath}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown generation error";

      logError(`Topic "${topic.slug}" failed: ${message}`);
    }
  }

  logInfo("Question bank generation finished");
}

generateQuestionBank().catch((error) => {
  const message =
    error instanceof Error ? error.message : "Unknown fatal generation error";

  logError(`Fatal generator error: ${message}`);
  process.exitCode = 1;
});