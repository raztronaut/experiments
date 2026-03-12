import { notFound } from "next/navigation";
import { getRegistryLLMText } from "@/lib/registry-llm-text";
import { registrySource } from "@/lib/registry-source";

export const revalidate = false;

interface RouteContext {
  params: Promise<{ slug: string[] }>;
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { slug } = await params;
  const page = registrySource.getPage(slug);
  if (!page) {
    notFound();
  }

  const text = await getRegistryLLMText(page);
  return new Response(text, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

export function generateStaticParams() {
  return registrySource
    .generateParams()
    .filter((p) => p.slug && p.slug.length > 0);
}
