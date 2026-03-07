import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { readingTime } from "reading-time-estimator";

export interface Article {
  description?: string;
  experimentHref: string;
  experimentSlug: string;
  href: string;
  publishedAt: string;
  slug: string;
  title: string;
  updatedAt?: string;
}

export const getArticles = cache(async (): Promise<Article[]> => {
  const experimentsDir = path.join(process.cwd(), "src/app/experiments");

  try {
    const entries = await fs.readdir(experimentsDir, { withFileTypes: true });
    const routeGroups = entries.filter(
      (d) => d.isDirectory() && d.name.startsWith("(") && d.name !== "(index)"
    );

    const articles: Article[] = [];

    for (const group of routeGroups) {
      const groupPath = path.join(experimentsDir, group.name);

      const slugDirs = (
        await fs.readdir(groupPath, { withFileTypes: true })
      ).filter((d) => d.isDirectory() && !d.name.startsWith("."));

      for (const slugDir of slugDirs) {
        const contentPath = path.join(
          groupPath,
          slugDir.name,
          "article",
          "content.mdx"
        );

        try {
          await fs.access(contentPath);
        } catch {
          continue;
        }

        try {
          const raw = await fs.readFile(contentPath, "utf-8");
          const { data } = matter(raw);

          articles.push({
            title: data.title || slugDir.name,
            description: data.description,
            slug: slugDir.name,
            experimentSlug: slugDir.name,
            publishedAt:
              data.publishedAt ||
              data.time?.created ||
              "1970-01-01T00:00:00.000Z",
            updatedAt: data.updatedAt || data.time?.updated,
            href: `/experiments/${slugDir.name}/article`,
            experimentHref: `/experiments/${slugDir.name}`,
          });
        } catch (error) {
          console.warn(`Failed to parse article ${slugDir.name}:`, error);
        }
      }
    }

    return articles.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch {
    return [];
  }
});

export interface ArticleFrontmatter {
  description?: string;
  publishedAt?: string;
  title?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ArticleContent {
  content: string;
  frontmatter: ArticleFrontmatter;
  readingMinutes: number;
}

export const getArticleContent = cache(
  async (slug: string): Promise<ArticleContent | null> => {
    const filePath = path.join(
      process.cwd(),
      `src/app/experiments/(${slug})/${slug}/article/content.mdx`
    );

    try {
      await fs.access(filePath);
    } catch {
      console.warn(`[articles] content.mdx not found: ${filePath}`);
      return null;
    }

    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const { data, content } = matter(raw);
      const estimate = readingTime(content);
      return { frontmatter: data, content, readingMinutes: estimate.minutes };
    } catch (error) {
      console.warn(`[articles] Failed to read article "${slug}":`, error);
      return null;
    }
  }
);
