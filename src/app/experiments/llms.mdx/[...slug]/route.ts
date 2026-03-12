import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getArticleContent } from "@/lib/articles";
import { SITE_URL } from "@/lib/constants";
import type { Experiment } from "@/lib/experiments";
import { getExperiments } from "@/lib/experiments";
import { mdxToPlainMarkdown } from "@/lib/feed-utils";

export const revalidate = false;

const REGISTRY_DIR = path.join(process.cwd(), "public/registry");

const MARKDOWN_HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  "Cache-Control": "public, max-age=86400, s-maxage=86400",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

interface RouteContext {
  params: Promise<{ slug: string[] }>;
}

async function loadRegistryFiles(slug: string): Promise<string[] | null> {
  const regPath = path.join(REGISTRY_DIR, `${slug}.json`);
  try {
    const raw = await fs.readFile(regPath, "utf-8");
    const data = JSON.parse(raw);
    return (data.files || []).map(
      (f: { path?: string; name?: string }) => f.path || f.name || "unknown"
    );
  } catch {
    return null;
  }
}

function experimentToMarkdown(
  exp: Experiment,
  files: string[] | null
): string {
  const lines: string[] = [];
  lines.push(`# ${exp.title} (${SITE_URL}/experiments/${exp.slug})`);
  lines.push("");

  if (exp.description) {
    lines.push(`> ${exp.description}`);
    lines.push("");
  }

  const meta: string[] = [];
  if (exp.status) {
    meta.push(`- **Status**: ${exp.status}`);
  }
  if (exp.profile) {
    meta.push(`- **Profile**: ${exp.profile}`);
  }
  if (exp.complexity) {
    meta.push(`- **Complexity**: ${exp.complexity}`);
  }
  if (exp.tags?.length) {
    meta.push(`- **Tags**: ${exp.tags.join(", ")}`);
  }
  if (exp.tech?.length) {
    meta.push(`- **Tech**: ${exp.tech.join(", ")}`);
  }
  if (exp.created) {
    meta.push(`- **Created**: ${exp.created}`);
  }
  meta.push(`- **Demo**: ${SITE_URL}/experiments/${exp.slug}`);

  if (meta.length) {
    lines.push(...meta);
    lines.push("");
  }

  if (files?.length) {
    lines.push("## Source Files");
    for (const f of files) {
      const basename = f.split("/").pop() || f;
      lines.push(`- ${basename}`);
    }
    lines.push("");
  }

  lines.push("## Install");
  lines.push("```bash");
  lines.push(`npx shadcn add ${SITE_URL}/r/${exp.slug}`);
  lines.push("```");
  lines.push("");

  return lines.join("\n");
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { slug: segments } = await params;
  if (!segments?.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const slug = segments[0];
  const isArticle = segments.length > 1 && segments[1] === "article";

  if (isArticle) {
    const article = await getArticleContent(slug);
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }
    const markdown = mdxToPlainMarkdown(article.content);
    const title = article.frontmatter.title || slug;
    const body = `# ${title} (${SITE_URL}/experiments/${slug}/article)\n\n${markdown}`;
    return new Response(body, { headers: MARKDOWN_HEADERS });
  }

  const experiments = await getExperiments();
  const exp = experiments.find((e) => e.slug === slug);
  if (!exp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const files = await loadRegistryFiles(slug);
  const body = experimentToMarkdown(exp, files);
  return new Response(body, { headers: MARKDOWN_HEADERS });
}
