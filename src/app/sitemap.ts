import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/articles";
import { SITE_URL } from "@/lib/constants";
import { getExperiments } from "@/lib/experiments";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const experiments = await getExperiments();
  const articles = await getArticles();

  const experimentUrls: MetadataRoute.Sitemap = experiments.map((exp) => {
    const entry: MetadataRoute.Sitemap[number] = {
      url: `${SITE_URL}/experiments/${exp.slug}`,
      lastModified: new Date(exp.updated || exp.created),
      changeFrequency: "monthly",
      priority: 0.7,
    };

    if (exp.poster) {
      entry.images = [`${SITE_URL}${exp.poster}`];
    }

    if (exp.video) {
      entry.videos = [
        {
          title: exp.title,
          thumbnail_loc: `${SITE_URL}/experiments/${exp.slug}/poster.jpg`,
          description: exp.description || exp.title,
          content_loc: `${SITE_URL}${exp.video}`,
        },
      ];
    }

    return entry;
  });

  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}${article.href}`,
    lastModified: new Date(article.updatedAt || article.publishedAt),
    changeFrequency: "monthly",
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
    {
      url: `${SITE_URL}/feed.xml`,
      changeFrequency: "weekly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/atom.xml`,
      changeFrequency: "weekly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/feed.json`,
      changeFrequency: "weekly",
      priority: 0.3,
    },
  ];
}
