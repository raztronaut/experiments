import { getArticles } from "@/lib/articles";
import { SITE_URL } from "@/lib/constants";

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

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Razi's Experiments Lab</title>
    <link>${SITE_URL}</link>
    <description>Creative coding experiments -- shaders, 3D, animation, and interaction design.</description>
    <language>en-us</language>
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
