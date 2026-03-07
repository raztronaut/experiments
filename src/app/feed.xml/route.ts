import { getArticles } from "@/lib/articles";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/constants";

export async function GET() {
  const articles = await getArticles();

  const items = articles
    .map(
      (article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${SITE_URL}${article.href}</link>
      <guid isPermaLink="true">${SITE_URL}${article.href}</guid>${article.description ? `\n      <description>${escapeXml(article.description)}</description>` : ""}
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
    </item>`
    )
    .join("\n");

  const lastBuildDate =
    articles.length > 0
      ? new Date(articles[0].publishedAt).toUTCString()
      : new Date().toUTCString();

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
