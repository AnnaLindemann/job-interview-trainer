export const analysisResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: {
      type: "string",
    },
    strengths: {
      type: "array",
      items: {
        type: "string",
      },
      minItems: 1,
      maxItems: 5,
    },
    improvements: {
      type: "array",
      items: {
        type: "string",
      },
      minItems: 1,
      maxItems: 5,
    },
    technicalScore: {
      type: ["integer", "null"],
      minimum: 0,
      maximum: 100,
    },
    grammarScore: {
      type: ["integer", "null"],
      minimum: 0,
      maximum: 100,
    },
  },
  required: [
    "summary",
    "strengths",
    "improvements",
    "technicalScore",
    "grammarScore",
  ],
} as const;