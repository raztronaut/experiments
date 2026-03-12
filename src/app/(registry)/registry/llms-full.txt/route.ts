import { getRegistryLLMText } from "@/lib/registry-llm-text";
import { registrySource } from "@/lib/registry-source";

export const revalidate = false;

export async function GET() {
  const pages = registrySource.getPages();
  const texts = await Promise.all(pages.map(getRegistryLLMText));
  return new Response(texts.join("\n\n"));
}
