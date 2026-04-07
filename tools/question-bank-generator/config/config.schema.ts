import { z } from "zod";

const topicConfigSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid topic slug format"),
  title: z.string().min(1),
  roleSlug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid roleSlug format"),
  focusAreas: z.array(z.string().min(1)).min(1),
});

const generatorDefaultsSchema = z.object({
  questionsPerFile: z.number().int().min(1).max(200),
  temperature: z.number().min(0).max(1),
  overwrite: z.boolean(),
  maxRetries: z.number().int().min(0).max(5),
});

const generatorOutputSchema = z.object({
  enDir: z.string().min(1),
  deDir: z.string().min(1),
});

export const generatorConfigSchema = z.object({
  provider: z.literal("groq"),
  model: z.string().min(1),
  defaults: generatorDefaultsSchema,
  output: generatorOutputSchema,
  topics: z.array(topicConfigSchema).min(1),
});

export type TopicConfig = z.infer<typeof topicConfigSchema>;
export type GeneratorDefaults = z.infer<typeof generatorDefaultsSchema>;
export type GeneratorOutput = z.infer<typeof generatorOutputSchema>;
export type GeneratorConfig = z.infer<typeof generatorConfigSchema>;