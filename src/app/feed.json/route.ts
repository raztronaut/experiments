import { getArticles } from "@/lib/articles";
import {
  AUTHOR_NAME,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/constants";
import { mdxToPlainMarkdown } from "@/lib/feed-utils";

export const revalidate = 3600;

export async function GET() {
  const articles = await getArticles();

  const items = articles.map((article) => {
    return {
      id: `${SITE_URL}${article.href}`,
      url: `${SITE_URL}${article.href}`,
      title: article.title,
      ...(article.description && { summary: article.description }),
      ...(article.content && {
        content_text: mdxToPlainMarkdown(article.content),
      }),
      date_published: new Date(article.publishedAt).toISOString(),
      ...(article.updatedAt && {
        date_modified: new Date(article.updatedAt).toISOString(),
      }),
      authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
      ...(article.tech && article.tech.length > 0 && { tags: article.tech }),
    };
  });

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    language: "en-US",
    authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
    items,
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
