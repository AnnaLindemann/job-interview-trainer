import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  generatorConfigSchema,
  type GeneratorConfig,
} from "../config/config.schema";

const CONFIG_FILE_PATH = path.resolve(
  process.cwd(),
  "tools/question-bank-generator/config/generator.config.json"
);

export async function loadConfig(): Promise<GeneratorConfig> {
  const rawFile = await readFile(CONFIG_FILE_PATH, "utf-8");

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawFile);
  } catch {
    throw new Error(`Invalid JSON in config file: ${CONFIG_FILE_PATH}`);
  }

  const parsedConfig = generatorConfigSchema.safeParse(parsedJson);

  if (!parsedConfig.success) {
    throw new Error(
      `Invalid generator config:\n${parsedConfig.error.issues
        .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}`
    );
  }

  return parsedConfig.data;
}