import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "tools",
  "sw.template.js",
);
const OUTPUT_PATH = path.join(process.cwd(), "public", "sw.js");

const template = readFileSync(TEMPLATE_PATH, "utf8");

const hash = createHash("sha256")
  .update(template)
  .digest("hex")
  .slice(0, 10);

const cacheName = `ai-interview-practice-static-${hash}`;
const output = template.replace("__CACHE_NAME__", cacheName);

writeFileSync(OUTPUT_PATH, output, "utf8");

console.log(`Generated public/sw.js with CACHE_NAME="${cacheName}"`);
