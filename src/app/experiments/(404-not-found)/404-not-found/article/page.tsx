import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { articleComponents } from "@/components/mdx";
import { ArticleLayout } from "@/components/ui/ArticleLayout";
import { getAdjacentArticles, getArticleContent } from "@/lib/articles";
import { SITE_URL } from "@/lib/constants";
import { getRelatedSlugs } from "@/lib/experiments";
import {
  articleRehypePlugins,
  articleRemarkPlugins,
} from "@/lib/mdx-article-config";
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  safeJsonLdStringify,
} from "@/lib/structured-data";
import experiment from "../../experiment.json";
import {
  DualFaceTextureDemo,
  ScrollVelocityDemo,
  WaveDeformationDemo,
} from "./components";

const ogImageUrl = `/api/og?${new URLSearchParams({ title: experiment.title, tags: (experiment.tags as string[]).join(",") })}`;

export async function generateMetadata() {
  const articleContent = await getArticleContent(experiment.slug);
  const description =
    articleContent?.frontmatter.description ?? experiment.description;
  return {
    title: `${experiment.title} — Article`,
    description,
    alternates: {
      canonical: `${SITE_URL}/experiments/${experiment.slug}/article`,
    },
    openGraph: {
      title: `${experiment.title} — Article`,
      description,
      images: [ogImageUrl],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${experiment.title} — Article`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ArticlePage() {
  const [articleContent, { prev, next }] = await Promise.all([
    getArticleContent(experiment.slug),
    getAdjacentArticles(experiment.slug),
  ]);
  if (!articleContent) {
    notFound();
  }
  const { frontmatter, content, readingMinutes } = articleContent;

  const articleJsonLd = generateArticleJsonLd({
    title: frontmatter.title || experiment.title,
    description: frontmatter.description ?? experiment.description,
    slug: experiment.slug,
    datePublished: frontmatter.publishedAt || experiment.created,
    dateModified: frontmatter.updatedAt,
    tags: experiment.tags as string[],
    ogImageUrl,
    wordCount: Math.round(readingMinutes * 200),
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
            WaveDeformationDemo,
            DualFaceTextureDemo,
            ScrollVelocityDemo,
          }}
          options={{
            mdxOptions: {
              remarkPlugins: [...articleRemarkPlugins],
              rehypePlugins: [...articleRehypePlugins],
            },
          }}
          source={content}
        />
      </ArticleLayout>
    </>
  );
}
