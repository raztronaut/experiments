import { getArticleContent, getArticles } from "@/lib/articles";
import {
  AUTHOR_NAME,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/constants";
import { escapeXml, mdxToPlainMarkdown } from "@/lib/feed-utils";

export const revalidate = 3600;

export async function GET() {
  const articles = await getArticles();

  const entries = await Promise.all(
    articles.map(async (article) => {
      const full = await getArticleContent(article.slug);
      const contentBlock = full
        ? `\n    <content type="text"><![CDATA[${mdxToPlainMarkdown(full.content)}]]></content>`
        : "";

      const updated = article.updatedAt || article.publishedAt;

      const categories = (article.tech || [])
        .map((t) => `\n    <category term="${escapeXml(t)}" />`)
        .join("");

      return `  <entry>
    <title>${escapeXml(article.title)}</title>
    <link href="${SITE_URL}${article.href}" rel="alternate" type="text/html" />
    <id>${SITE_URL}${article.href}</id>
    <published>${new Date(article.publishedAt).toISOString()}</published>
    <updated>${new Date(updated).toISOString()}</updated>${article.description ? `\n    <summary>${escapeXml(article.description)}</summary>` : ""}${contentBlock}
    <author>
      <name>${escapeXml(AUTHOR_NAME)}</name>
      <uri>${SITE_URL}</uri>
    </author>${categories}
  </entry>`;
    })
  );

  const latestUpdated =
    articles.length > 0
      ? new Date(
          Math.max(
            ...articles.map((a) =>
              new Date(a.updatedAt || a.publishedAt).getTime()
            )
          )
        ).toISOString()
      : new Date().toISOString();

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${SITE_URL}/feed-styles.xsl"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(SITE_TITLE)}</title>
  <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>
  <link href="${SITE_URL}" rel="alternate" type="text/html" />
  <link href="${SITE_URL}/atom.xml" rel="self" type="application/atom+xml" />
  <id>${SITE_URL}/</id>
  <updated>${latestUpdated}</updated>
  <author>
    <name>${escapeXml(AUTHOR_NAME)}</name>
    <uri>${SITE_URL}</uri>
  </author>
  <generator>Next.js</generator>
${entries.join("\n")}
</feed>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
