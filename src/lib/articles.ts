import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

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

export function getArticles(): Article[] {
  const experimentsDir = path.join(process.cwd(), "src/app/experiments");

  try {
    const entries = fs.readdirSync(experimentsDir, { withFileTypes: true });
    const routeGroups = entries.filter(
      (d) => d.isDirectory() && d.name.startsWith("(") && d.name !== "(index)"
    );

    const articles: Article[] = [];

    for (const group of routeGroups) {
      const groupPath = path.join(experimentsDir, group.name);

      const slugDirs = fs
        .readdirSync(groupPath, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("."));

      for (const slugDir of slugDirs) {
        const contentPath = path.join(
          groupPath,
          slugDir.name,
          "article",
          "content.mdx"
        );

        if (!fs.existsSync(contentPath)) {
          continue;
        }

        try {
          const raw = fs.readFileSync(contentPath, "utf-8");
          const { data } = matter(raw);

          articles.push({
            title: data.title || slugDir.name,
            description: data.description,
            slug: slugDir.name,
            experimentSlug: slugDir.name,
            publishedAt:
              data.publishedAt ||
              data.time?.created ||
              new Date().toISOString(),
            updatedAt: data.updatedAt || data.time?.updated,
            href: `/experiments/${slugDir.name}/article`,
            experimentHref: `/experiments/${slugDir.name}`,
          });
        } catch {}
      }
    }

    return articles.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch {
    return [];
  }
}
