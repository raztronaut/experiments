import { llms } from "fumadocs-core/source";
import { registrySource } from "@/lib/registry-source";

export const revalidate = false;

export function GET() {
  return new Response(llms(registrySource).index());
}
