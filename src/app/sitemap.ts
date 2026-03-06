import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/articles";
import { getExperiments } from "@/lib/experiments";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const experiments = await getExperiments();
  const articles = getArticles();
  const baseUrl = "https://www.razisyed.cv";

  const experimentUrls = experiments.map((exp) => ({
    url: `${baseUrl}/experiments/${exp.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articleUrls = articles.map((article) => ({
    url: `${baseUrl}${article.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...experimentUrls,
    ...articleUrls,
  ];
}
