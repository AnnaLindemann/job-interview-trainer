import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

type WriteJsonFileParams = {
  filePath: string;
  data: unknown;
};

export async function writeJsonFile(params: WriteJsonFileParams): Promise<void> {
  const absoluteFilePath = path.resolve(process.cwd(), params.filePath);
  const directoryPath = path.dirname(absoluteFilePath);
  const tempFilePath = `${absoluteFilePath}.tmp`;

  await mkdir(directoryPath, { recursive: true });
  await writeFile(tempFilePath, JSON.stringify(params.data, null, 2) + "\n", "utf-8");
  await rename(tempFilePath, absoluteFilePath);
}