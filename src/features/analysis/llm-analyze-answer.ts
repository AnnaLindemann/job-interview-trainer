import { prisma } from "@/src/db/prisma";
import type {
  AnalyzeAnswerParams,
  AnalyzeAnswerResult,
} from "@/src/features/analysis/analysis.types";
import { buildAnalysisPrompt } from "@/src/features/analysis/build-analysis-prompt";
import { analysisResponseSchema } from "@/src/features/analysis/analysis-response.schema";
import { calculateLlmCostUsd } from "@/src/features/analysis/calculate-llm-cost";
import { extractGroqUsage } from "@/src/features/analysis/extract-groq-usage";
import type { SupportedLlmModel } from "@/src/features/analysis/llm-pricing";

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

const DEFAULT_GROQ_MODEL: SupportedLlmModel = "llama-3.3-70b-versatile";
const PROMPT_VERSION = "analysis-v2";

function getSupportedModel(model: string): SupportedLlmModel {
  if (model === "llama-3.1-8b-instant") {
    return model;
  }

  if (model === "llama-3.3-70b-versatile") {
    return model;
  }

  return DEFAULT_GROQ_MODEL;
}

export async function llmAnalyzeAnswer(
  params: AnalyzeAnswerParams
): Promise<AnalyzeAnswerResult> {
  const apiKey = process.env.GROQ_API_KEY;
  const rawModel = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
  const model = getSupportedModel(rawModel);

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const prompt = buildAnalysisPrompt(params);
  const startedAt = Date.now();

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "You are a strict technical interviewer.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_object",
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`Groq API error: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as GroqChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq API returned empty content");
    }

    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(content);
    } catch {
      throw new Error("LLM returned invalid JSON");
    }

    const parsed = analysisResponseSchema.safeParse(parsedJson);

    if (!parsed.success) {
      throw new Error("LLM returned schema-invalid analysis");
    }

    const usage = extractGroqUsage(data.usage);
    const estimatedCostUsd = calculateLlmCostUsd(model, {
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
    });

    const latencyMs = Date.now() - startedAt;

    await prisma.llmUsageLog.create({
      data: {
        feature: "answer_analysis",
        model,
        promptVersion: PROMPT_VERSION,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        estimatedCostUsd,
        latencyMs,
        status: "success",
        sessionId: null,
        questionId: null,
        attemptId: null,
      },
    });

    return parsed.data;
  } catch (error) {
    const latencyMs = Date.now() - startedAt;

    await prisma.llmUsageLog.create({
      data: {
        feature: "answer_analysis",
        model,
        promptVersion: PROMPT_VERSION,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCostUsd: 0,
        latencyMs,
        status: "error",
        sessionId: null,
        questionId: null,
        attemptId: null,
      },
    });

    throw error;
  }
}