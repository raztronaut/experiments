#!/usr/bin/env node

/**
 * Generates public/llms.txt and public/llms-full.txt from experiment data.
 * llms.txt follows v1.1.1 spec: curated summary for LLM discovery.
 * llms-full.txt: extended version with full descriptions, tech stacks, and article info.
 * Run as part of the build chain: npm run generate:llms-txt
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_TITLE, SITE_URL } from "./lib/site-config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPERIMENTS_DIR = path.resolve(__dirname, "..", "src/app/experiments");
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

function loadExperiments() {
  const experiments = [];
  const entries = fs.readdirSync(EXPERIMENTS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!(entry.isDirectory() && entry.name.startsWith("("))) {
      continue;
    }

    const routeGroup = entry.name;
    const slug = routeGroup.slice(1, -1);
    const jsonPath = path.join(EXPERIMENTS_DIR, routeGroup, "experiment.json");

    if (!fs.existsSync(jsonPath)) {
      continue;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    if (data.status === "wip") {
      continue;
    }

    if ((data.listing || "public") === "registry") {
      continue;
    }

    const hasArticle = fs.existsSync(
      path.join(EXPERIMENTS_DIR, routeGroup, slug, "article", "content.mdx")
    );

    let articleFrontmatter = null;
    if (hasArticle) {
      const mdxPath = path.join(
        EXPERIMENTS_DIR,
        routeGroup,
        slug,
        "article",
        "content.mdx"
      );
      const mdxContent = fs.readFileSync(mdxPath, "utf-8");
      const fmMatch = mdxContent.match(/^---\n([\s\S]*?)\n---/);
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        articleFrontmatter = {};
        for (const line of lines) {
          const [key, ...rest] = line.split(":");
          if (key && rest.length) {
            articleFrontmatter[key.trim()] = rest
              .join(":")
              .trim()
              .replace(/^["']|["']$/g, "");
          }
        }
      }
    }

    experiments.push({
      ...data,
      slug,
      hasArticle,
      articleFrontmatter,
    });
  }

  const sorted = experiments.sort((a, b) => a.title.localeCompare(b.title));
  // Keep 404-not-found last so llms.txt does not start with "404 Not Found" (avoids AI Visibility checker soft_404 false positive)
  const fourOhFour = sorted.findIndex((e) => e.slug === "404-not-found");
  if (fourOhFour !== -1 && fourOhFour < sorted.length - 1) {
    const [item] = sorted.splice(fourOhFour, 1);
    sorted.push(item);
  }
  return sorted;
}

function generateLlmsTxt(experiments) {
  const articles = experiments.filter((e) => e.hasArticle);
  const lines = [];

  lines.push(`# ${SITE_TITLE}`);
  lines.push("");
  lines.push(
    "> A creative coding lab exploring shaders, 3D graphics, animation, and interaction design. Each experiment is isolated, interactive, and close to publishable."
  );
  lines.push("");

  if (articles.length > 0) {
    lines.push("## Articles");
    for (const exp of articles) {
      const desc = exp.articleFrontmatter?.description || exp.description;
      lines.push(
        `- [${exp.title}](${SITE_URL}/experiments/${exp.slug}/article): ${desc}`
      );
      lines.push(
        `  - Markdown: ${SITE_URL}/experiments/${exp.slug}/article.mdx`
      );
    }
    lines.push("");
  }

  lines.push("## Experiments");
  for (const exp of experiments) {
    lines.push(
      `- [${exp.title}](${SITE_URL}/experiments/${exp.slug}): ${exp.description}`
    );
  }
  lines.push("");

  lines.push("## Technical Details");
  lines.push("- Built with Next.js 16+ (App Router), React 19+, TypeScript");
  lines.push("- Animation: Motion (motion/react), GSAP with ScrollTrigger");
  lines.push("- 3D: React Three Fiber, Three.js, custom GLSL shaders");
  lines.push("- Scroll: Lenis smooth scroll with Tempus RAF management");
  lines.push("- Styling: Tailwind CSS with shadcn/ui components");
  lines.push("");

  lines.push("## Content API");
  lines.push(
    "- Append `.mdx` to any experiment URL for a markdown summary: /experiments/{slug}.mdx"
  );
  lines.push(
    "- Append `.mdx` to any article URL for markdown content: /experiments/{slug}/article.mdx"
  );
  lines.push(
    "- Send `Accept: text/markdown` header to any article URL to get markdown automatically"
  );
  lines.push(
    `- Registry docs: ${SITE_URL}/registry/docs (browsable) or ${SITE_URL}/registry/llms.txt`
  );
  lines.push("");

  lines.push("## AI Discovery Files");
  lines.push(`- Sitemap: ${SITE_URL}/sitemap.xml`);
  lines.push(`- RSS: ${SITE_URL}/feed.xml`);
  lines.push(`- JSON Feed: ${SITE_URL}/feed.json`);
  lines.push(`- llms.txt: ${SITE_URL}/llms.txt`);
  lines.push(`- Registry docs: ${SITE_URL}/registry/docs`);
  lines.push("");

  lines.push("## Contact");
  lines.push("- Email: syed.raziulhaque@gmail.com");
  lines.push("- GitHub: https://github.com/raztronaut");
  lines.push("- X (Twitter): https://x.com/raztronaut");
  lines.push(`- Website: ${SITE_URL}`);
  lines.push("");

  return lines.join("\n");
}

function generateLlmsFullTxt(experiments) {
  const articles = experiments.filter((e) => e.hasArticle);
  const lines = [];

  lines.push(`# ${SITE_TITLE} — Full Content`);
  lines.push("");
  lines.push(
    "> A creative coding lab exploring shaders, 3D graphics, animation, and interaction design. Each experiment is isolated, interactive, and close to publishable."
  );
  lines.push("");

  if (articles.length > 0) {
    lines.push("## Published Articles");
    lines.push("");
    for (const exp of articles) {
      lines.push(`### ${exp.title}`);
      lines.push("");
      lines.push(`- URL: ${SITE_URL}/experiments/${exp.slug}/article`);
      lines.push(`- Experiment: ${SITE_URL}/experiments/${exp.slug}`);
      if (exp.articleFrontmatter?.publishedAt) {
        lines.push(`- Published: ${exp.articleFrontmatter.publishedAt}`);
      }
      lines.push(`- Description: ${exp.description}`);
      if (exp.tags?.length) {
        lines.push(`- Tags: ${exp.tags.join(", ")}`);
      }
      if (exp.tech?.length) {
        lines.push(`- Technologies: ${exp.tech.join(", ")}`);
      }
      lines.push("");
    }
  }

  lines.push("## All Experiments");
  lines.push("");

  for (const exp of experiments) {
    lines.push(`### ${exp.title}`);
    lines.push("");
    lines.push(`- URL: ${SITE_URL}/experiments/${exp.slug}`);
    lines.push(`- Description: ${exp.description}`);
    if (exp.complexity) {
      lines.push(`- Complexity: ${exp.complexity}`);
    }
    if (exp.profile) {
      lines.push(`- Profile: ${exp.profile}`);
    }
    if (exp.status) {
      lines.push(`- Status: ${exp.status}`);
    }
    if (exp.created) {
      lines.push(`- Created: ${exp.created}`);
    }
    if (exp.tags?.length) {
      lines.push(`- Tags: ${exp.tags.join(", ")}`);
    }
    if (exp.tech?.length) {
      lines.push(`- Technologies: ${exp.tech.join(", ")}`);
    }
    if (exp.hasArticle) {
      lines.push(`- Article: ${SITE_URL}/experiments/${exp.slug}/article`);
      lines.push(
        `- Article (Markdown): ${SITE_URL}/experiments/${exp.slug}/article.mdx`
      );
    }
    lines.push(`- Markdown Summary: ${SITE_URL}/experiments/${exp.slug}.mdx`);
    lines.push("");
  }

  lines.push("## Technical Stack");
  lines.push("");
  lines.push(
    "- **Framework**: Next.js 16+ (App Router), React 19+, TypeScript strict mode"
  );
  lines.push(
    "- **Animation**: Motion (motion/react) for layout animations and gestures, GSAP with ScrollTrigger for scroll-driven animation"
  );
  lines.push(
    "- **3D**: React Three Fiber (@react-three/fiber), Three.js, custom GLSL vertex and fragment shaders, @react-three/drei helpers"
  );
  lines.push(
    "- **Scroll**: Lenis smooth scroll with Tempus unified RAF management"
  );
  lines.push(
    "- **Styling**: Tailwind CSS with shadcn/ui components, dual light/dark theme support"
  );
  lines.push(
    "- **Content**: MDX articles via next-mdx-remote/rsc with Shiki syntax highlighting"
  );
  lines.push(
    "- **Performance hooks**: Hamo (useRect, useWindowSize, useResizeObserver)"
  );
  lines.push("");

  lines.push("## Content API");
  lines.push("");
  lines.push(
    "Every experiment and article is available as machine-readable markdown:"
  );
  lines.push(
    "- **Experiment summary**: `GET /experiments/{slug}.mdx` — metadata, source files, install command"
  );
  lines.push(
    "- **Article content**: `GET /experiments/{slug}/article.mdx` — full article as clean markdown"
  );
  lines.push(
    "- **Content negotiation**: Send `Accept: text/markdown` to any article URL to receive markdown instead of HTML"
  );
  lines.push(
    `- **Registry docs**: \`GET ${SITE_URL}/registry/llms.txt\` — index of all registry documentation`
  );
  lines.push(
    `- **Registry full**: \`GET ${SITE_URL}/registry/llms-full.txt\` — complete registry content as markdown`
  );
  lines.push("");

  lines.push("## About");
  lines.push("");
  lines.push("Built by Razi Syed, a Design Engineer.");
  lines.push(`- Website: ${SITE_URL}`);
  lines.push("- GitHub: https://github.com/raztronaut");
  lines.push("- X (Twitter): https://x.com/raztronaut");
  lines.push("");

  return lines.join("\n");
}

function writeIfChangedSync(filePath, content) {
  try {
    const existing = fs.readFileSync(filePath, "utf-8");
    if (existing === content) {
      return false;
    }
  } catch {
    // File doesn't exist — fall through to write
  }
  fs.writeFileSync(filePath, content);
  return true;
}

try {
  const experiments = loadExperiments();
  const llmsTxt = generateLlmsTxt(experiments);
  const llmsFullTxt = generateLlmsFullTxt(experiments);

  const llmsWrote = writeIfChangedSync(
    path.join(PUBLIC_DIR, "llms.txt"),
    llmsTxt
  );
  const fullWrote = writeIfChangedSync(
    path.join(PUBLIC_DIR, "llms-full.txt"),
    llmsFullTxt
  );

  const articleCount = experiments.filter((e) => e.hasArticle).length;
  console.log(
    `${llmsWrote ? "✅" : "⏩"} llms.txt (${experiments.length} experiments, ${articleCount} articles)${llmsWrote ? "" : " unchanged"}`
  );
  console.log(
    `${fullWrote ? "✅" : "⏩"} llms-full.txt (${llmsFullTxt.split("\n").length} lines)${fullWrote ? "" : " unchanged"}`
  );
} catch (error) {
  console.error("❌ generate-llms-txt failed:", error.message);
  process.exit(1);
}
