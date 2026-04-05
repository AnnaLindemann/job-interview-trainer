export type SupportedLlmModel =
  | "llama-3.1-8b-instant"
  | "llama-3.3-70b-versatile";

export type ModelPricing = {
  inputPer1MUsd: number;
  outputPer1MUsd: number;
};

export const MODEL_PRICING: Record<SupportedLlmModel, ModelPricing> = {
  "llama-3.1-8b-instant": {
    inputPer1MUsd: 0.05,
    outputPer1MUsd: 0.08,
  },
  "llama-3.3-70b-versatile": {
    inputPer1MUsd: 0.59,
    outputPer1MUsd: 0.79,
  },
};