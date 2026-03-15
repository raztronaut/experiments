import "katex/dist/katex.min.css";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { articleComponents } from "@/components/mdx";
import { ArticleLayout } from "@/components/ui/ArticleLayout";
import { getAdjacentArticles, getArticleContent } from "@/lib/articles";
import { getRelatedSlugs } from "@/lib/experiments";
import { SITE_URL } from "@/lib/constants";
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  safeJsonLdStringify,
} from "@/lib/structured-data";
import experiment from "../../experiment.json";

import {
  ConformalScaleDemo,
  EuclideanVsHyperbolicDemo,
  GeodesicDemo,
  HyperbolicTreeDemo,
  MobiusTransformDemo,
} from "./components";

const ogImageUrl = `/api/og?${new URLSearchParams({ title: experiment.title, tags: (experiment.tags as string[]).join(",") })}`;

export const metadata = {
  title: `${experiment.title} — Article`,
  description: experiment.description,
  alternates: {
    canonical: `${SITE_URL}/experiments/${experiment.slug}/article`,
  },
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

export default async function ArticlePage() {
  const articleContent = await getArticleContent(experiment.slug);
  if (!articleContent) {
    notFound();
  }
  const { frontmatter, content, readingMinutes } = articleContent;
  const { prev, next } = await getAdjacentArticles(experiment.slug);

  const articleJsonLd = generateArticleJsonLd({
    title: frontmatter.title || experiment.title,
    description: experiment.description,
    slug: experiment.slug,
    datePublished: frontmatter.publishedAt || experiment.created,
    dateModified: frontmatter.updatedAt,
    tags: experiment.tags as string[],
    ogImageUrl,
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    {
      name: experiment.title,
      url: `${SITE_URL}/experiments/${experiment.slug}`,
    },
    {
      name: "Article",
      url: `${SITE_URL}/experiments/${experiment.slug}/article`,
    },
  ]);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(articleJsonLd) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(breadcrumbJsonLd),
        }}
        type="application/ld+json"
      />
      <ArticleLayout
        experimentSlug={experiment.slug}
        experimentTitle={experiment.title}
        next={next ? { title: next.title, href: next.href } : undefined}
        prev={prev ? { title: prev.title, href: prev.href } : undefined}
        related={getRelatedSlugs(experiment)}
        publishedAt={frontmatter.publishedAt || experiment.created}
        readingTime={`${readingMinutes} min read`}
        title={frontmatter.title || experiment.title}
        updatedAt={frontmatter.updatedAt}
      >
        <MDXRemote
          components={{
            ...articleComponents,
            EuclideanVsHyperbolicDemo,
            MobiusTransformDemo,
            GeodesicDemo,
            ConformalScaleDemo,
            HyperbolicTreeDemo,
          }}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, remarkMath],
              rehypePlugins: [
                rehypeKatex,
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
    </>
  );
}
