import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { showDevContent } from "./env";

function estimateReadingTimeMinutes(text: string): number {
  let wordCount = 0;
  const regex = /\S+/g;
  while (regex.exec(text) !== null) {
    wordCount++;
  }
  // Standard reading speed is typically around 200-250 words per minute
  return Math.ceil(wordCount / 238);
}

export interface Article {
  content?: string;
  description?: string;
  experimentHref: string;
  experimentSlug: string;
  href: string;
  listing?: string;
  poster?: string;
  publishedAt: string;
  readingMinutes: number;
  slug: string;
  status?: string;
  tech?: string[];
  title: string;
  updatedAt?: string;
}

export const getArticles = cache(
  async (includeContent = false): Promise<Article[]> => {
    const experimentsDir = path.join(process.cwd(), "src/app/experiments");

    try {
      const entries = await fs.readdir(experimentsDir, { withFileTypes: true });
      const routeGroups = entries.filter(
        (d) => d.isDirectory() && d.name.startsWith("(") && d.name !== "(index)"
      );

      const slugDirEntries = await Promise.all(
        routeGroups.map(async (group) => {
          const groupPath = path.join(experimentsDir, group.name);
          const dirs = (
            await fs.readdir(groupPath, { withFileTypes: true })
          ).filter((d) => d.isDirectory() && !d.name.startsWith("."));
          return dirs.map((d) => ({ groupPath, name: d.name }));
        })
      );

      const candidates = slugDirEntries.flat();

      const results = await Promise.all(
        candidates.map(async ({ groupPath, name }): Promise<Article | null> => {
          const contentPath = path.join(
            groupPath,
            name,
            "article",
            "content.mdx"
          );

          try {
            const raw = await fs.readFile(contentPath, "utf-8");
            const { data, content } = matter(raw);

            let tech: string[] | undefined;
            let poster: string | undefined;
            let status: string | undefined;
            let listing: string | undefined;
            try {
              const expJson = await fs.readFile(
                path.join(groupPath, "experiment.json"),
                "utf-8"
              );
              const exp = JSON.parse(expJson);
              tech = exp.tech;
              poster = exp.poster;
              status = exp.status;
              listing = exp.listing;
            } catch {
              // experiment.json not found or invalid -- skip enrichment
            }

            return {
              title: data.title || name,
              description: data.description,
              ...(includeContent && { content }),
              slug: name,
              experimentSlug: name,
              publishedAt:
                data.publishedAt ||
                data.time?.created ||
                "1970-01-01T00:00:00.000Z",
              readingMinutes: estimateReadingTimeMinutes(content),
              updatedAt: data.updatedAt || data.time?.updated,
              href: `/experiments/${name}/article`,
              experimentHref: `/experiments/${name}`,
              tech,
              poster,
              status,
              listing,
            };
          } catch {
            return null;
          }
        })
      );

      let articles = results.filter((a): a is Article => a !== null);

      // WIP articles are never shown publicly
      articles = articles.filter((a) => a.status !== "wip");

      // In production, only show articles for public experiments
      if (!showDevContent) {
        articles = articles.filter((a) => (a.listing ?? "public") === "public");
      }

      return articles.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } catch {
      return [];
    }
  }
);

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

export const getAdjacentArticles = cache(async (experimentSlug: string) => {
  const articles = await getArticles();
  const idx = articles.findIndex((a) => a.experimentSlug === experimentSlug);
  return {
    prev: idx > 0 ? articles[idx - 1] : undefined,
    next: idx < articles.length - 1 ? articles[idx + 1] : undefined,
  };
});

export const getArticleContent = cache(
  async (slug: string): Promise<ArticleContent | null> => {
    const filePath = path.join(
      process.cwd(),
      `src/app/experiments/(${slug})/${slug}/article/content.mdx`
    );

    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const { data, content } = matter(raw);
      const minutes = estimateReadingTimeMinutes(content);
      return { frontmatter: data, content, readingMinutes: minutes };
    } catch {
      return null;
    }
  }
);
