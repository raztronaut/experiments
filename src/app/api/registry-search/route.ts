import { createFromSource } from "fumadocs-core/search/server";
import { registrySource } from "@/lib/registry-source";

export const { GET } = createFromSource(registrySource, {
  buildIndex(page) {
    const slugParts = page.url.split("/").filter(Boolean);
    const category = slugParts[2];
    const data = page.data as unknown as Record<string, unknown>;

    return {
      id: page.url,
      title: (data.title as string) ?? "",
      description: data.description as string | undefined,
      url: page.url,
      structuredData:
        data.structuredData as import("fumadocs-core/mdx-plugins").StructuredData,
      tag: category,
    };
  },
});
