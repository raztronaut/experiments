import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/articles";
import { SITE_URL } from "@/lib/constants";
import { getExperiments } from "@/lib/experiments";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const experiments = await getExperiments();
  const articles = await getArticles();

  const experimentUrls = experiments.map((exp) => ({
    url: `${SITE_URL}/experiments/${exp.slug}`,
    lastModified: new Date(exp.updated || exp.created),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articleUrls = articles.map((article) => ({
    url: `${SITE_URL}${article.href}`,
    lastModified: new Date(article.updatedAt || article.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...experimentUrls,
    ...articleUrls,
  ];
}
