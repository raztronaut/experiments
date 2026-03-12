import type { InferPageType } from "fumadocs-core/source";
import type { registrySource } from "./registry-source";

export async function getRegistryLLMText(
  page: InferPageType<typeof registrySource>
): Promise<string> {
  const processed = await page.data.getText("processed");
  return `# ${page.data.title} (${page.url})\n\n${processed}`;
}
