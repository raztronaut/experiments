import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import { readingTime } from "reading-time-estimator";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { articleComponents } from "@/components/mdx";
import { ArticleLayout } from "@/components/ui/ArticleLayout";
import { getArticles } from "@/lib/articles";
import experiment from "../../experiment.json";

function getArticleContent() {
  const filePath = path.join(
    process.cwd(),
    "src/app/experiments/(send-button)/send-button/article/content.mdx"
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const estimate = readingTime(content);
  return { frontmatter: data, content, readingMinutes: estimate.minutes };
}

export const metadata = {
  title: `${experiment.title} — Article`,
  description: experiment.description,
};

function getAdjacentArticles() {
  const articles = getArticles();
  const idx = articles.findIndex((a) => a.experimentSlug === experiment.slug);
  return {
    prev: idx > 0 ? articles[idx - 1] : undefined,
    next: idx < articles.length - 1 ? articles[idx + 1] : undefined,
  };
}

export default function ArticlePage() {
  const { frontmatter, content, readingMinutes } = getArticleContent();
  const { prev, next } = getAdjacentArticles();

  return (
    <ArticleLayout
      experimentSlug={experiment.slug}
      next={next ? { title: next.title, href: next.href } : undefined}
      prev={prev ? { title: prev.title, href: prev.href } : undefined}
      publishedAt={frontmatter.publishedAt || experiment.created}
      readingTime={`${readingMinutes} min read`}
      title={frontmatter.title || experiment.title}
      updatedAt={frontmatter.updatedAt}
    >
      <MDXRemote
        components={articleComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypePrettyCode,
                {
                  theme: { light: "github-light", dark: "github-dark" },
                  keepBackground: false,
                },
              ],
            ],
          },
        }}
        source={content}
      />
    </ArticleLayout>
  );
}
