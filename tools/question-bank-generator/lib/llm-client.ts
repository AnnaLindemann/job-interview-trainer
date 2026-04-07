type GroqChatCompletionResponse = {
  choices?: Array<{
    finish_reason?: string | null;
    message?: {
      content?: string | null;
    };
  }>;
};

type GenerateJsonParams = {
  prompt: string;
  model: string;
  temperature: number;
};

type GenerateJsonResult = {
  content: string;
  finishReason: string | null;
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function generateJsonWithGroq(
  params: GenerateJsonParams
): Promise<GenerateJsonResult> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      temperature: params.temperature,
      max_completion_tokens: 7000,
      messages: [
        {
          role: "system",
          content:
            "You generate structured interview question bank data. Return only valid JSON.",
        },
        {
          role: "user",
          content: params.prompt,
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
  const firstChoice = data.choices?.[0];
  const content = firstChoice?.message?.content;
  const finishReason = firstChoice?.finish_reason ?? null;

  if (!content) {
    throw new Error("Groq API returned empty content");
  }

  return {
    content,
    finishReason,
  };
}