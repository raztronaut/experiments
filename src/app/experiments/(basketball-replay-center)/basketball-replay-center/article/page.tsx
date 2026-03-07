import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { articleComponents } from "@/components/mdx";
import { ArticleLayout } from "@/components/ui/ArticleLayout";
import { getArticleContent, getArticles } from "@/lib/articles";
import experiment from "../../experiment.json";
import { BarrelDistortionDemo, CRTEffectDemo } from "./components";

const ogImageUrl = `/api/og?${new URLSearchParams({ title: experiment.title, tags: experiment.tags.join(",") })}`;

export const metadata = {
  title: `${experiment.title} — Article`,
  description: experiment.description,
  openGraph: {
    title: `${experiment.title} — Article`,
    description: experiment.description,
    images: [ogImageUrl],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: `${experiment.title} — Article`,
    description: experiment.description,
    images: [ogImageUrl],
  },
};

async function getAdjacentArticles() {
  const articles = await getArticles();
  const idx = articles.findIndex((a) => a.experimentSlug === experiment.slug);
  return {
    prev: idx > 0 ? articles[idx - 1] : undefined,
    next: idx < articles.length - 1 ? articles[idx + 1] : undefined,
  };
}

export default async function ArticlePage() {
  const articleContent = await getArticleContent(experiment.slug);
  if (!articleContent) {
    notFound();
  }
  const { frontmatter, content, readingMinutes } = articleContent;
  const { prev, next } = await getAdjacentArticles();

  return (
    <ArticleLayout
      experimentSlug={experiment.slug}
      experimentTitle={experiment.title}
      next={next ? { title: next.title, href: next.href } : undefined}
      prev={prev ? { title: prev.title, href: prev.href } : undefined}
      publishedAt={frontmatter.publishedAt || experiment.created}
      readingTime={`${readingMinutes} min read`}
      title={frontmatter.title || experiment.title}
      updatedAt={frontmatter.updatedAt}
    >
      <MDXRemote
        components={{
          ...articleComponents,
          BarrelDistortionDemo,
          CRTEffectDemo,
        }}
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
