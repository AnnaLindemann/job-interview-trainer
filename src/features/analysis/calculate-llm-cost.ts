import { MODEL_PRICING, type SupportedLlmModel } from "./llm-pricing";

export type LlmUsage = {
  promptTokens: number;
  completionTokens: number;
};

export function calculateLlmCostUsd(
  model: SupportedLlmModel,
  usage: LlmUsage,
): number {
  const pricing = MODEL_PRICING[model];

  const inputCost =
    (usage.promptTokens / 1_000_000) * pricing.inputPer1MUsd;

  const outputCost =
    (usage.completionTokens / 1_000_000) * pricing.outputPer1MUsd;

  return Number((inputCost + outputCost).toFixed(8));
}