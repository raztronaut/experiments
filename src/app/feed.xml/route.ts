import { getArticles } from "@/lib/articles";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/constants";
import { escapeXml, mdxToPlainMarkdown } from "@/lib/feed-utils";

export const revalidate = 3600;

export async function GET() {
  const articles = await getArticles();

  const items = articles.map((article) => {
    const contentBlock = article.content
      ? `\n      <content:encoded><![CDATA[${mdxToPlainMarkdown(article.content)}]]></content:encoded>`
      : "";

    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${SITE_URL}${article.href}</link>
      <guid isPermaLink="true">${SITE_URL}${article.href}</guid>${article.description ? `\n      <description>${escapeXml(article.description)}</description>` : ""}${contentBlock}
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
    </item>`;
  });

  const lastBuildDate =
    articles.length > 0
      ? new Date(
          Math.max(
            ...articles.map((a) =>
              new Date(a.updatedAt || a.publishedAt).getTime()
            )
          )
        ).toUTCString()
      : new Date().toUTCString();

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${SITE_URL}/feed-styles.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
