import { getArticleContent, getArticles } from "@/lib/articles";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

const CODE_FENCE_RE = /```[\s\S]*?```/g;
const JSX_TAG_RE = /<\/?[A-Z][A-Za-z]*[^>]*\/?>/g;
const IMPORT_RE = /^import\s.+$/gm;
const EXPORT_RE = /^export\s.+$/gm;
const EMPTY_LINES_RE = /\n{3,}/g;

function mdxToPlainMarkdown(mdx: string): string {
  const codeBlocks: string[] = [];
  const withPlaceholders = mdx.replace(CODE_FENCE_RE, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  const cleaned = withPlaceholders
    .replace(IMPORT_RE, "")
    .replace(EXPORT_RE, "")
    .replace(JSX_TAG_RE, "")
    .replace(EMPTY_LINES_RE, "\n\n")
    .trim();

  return cleaned.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => codeBlocks[idx]);
}

export async function GET() {
  const articles = await getArticles();

  const items = await Promise.all(
    articles.map(async (article) => {
      const full = await getArticleContent(article.slug);
      const contentBlock = full
        ? `\n      <content:encoded><![CDATA[${mdxToPlainMarkdown(full.content)}]]></content:encoded>`
        : "";

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${SITE_URL}${article.href}</link>
      <guid isPermaLink="true">${SITE_URL}${article.href}</guid>${article.description ? `\n      <description>${escapeXml(article.description)}</description>` : ""}${contentBlock}
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
    </item>`;
    })
  );

  const lastBuildDate =
    articles.length > 0
      ? new Date(articles[0].publishedAt).toUTCString()
      : new Date().toUTCString();

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
