#!/usr/bin/env node

/**
 * SEO audit: reads all experiment.json and article content.mdx frontmatter,
 * reports description lengths, duplicate titles/descriptions, missing tags/tech,
 * and writes docs/audits/seo-keywords-content-YYYY-MM.md.
 * Exit code 1 if critical issues (duplicate titles or duplicate meta descriptions).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPERIMENTS_DIR = path.resolve(__dirname, "..", "src/app/experiments");
const AUDIT_DIR = path.resolve(__dirname, "..", "docs/audits");

const DESC_EXP_MIN = 100;
const DESC_EXP_MAX = 180;
const DESC_ARTICLE_MAX = 155;
const TITLE_MAX = 60;

function collectExperiments() {
  const entries = fs.readdirSync(EXPERIMENTS_DIR, { withFileTypes: true });
  const groups = entries.filter(
    (d) => d.isDirectory() && d.name.startsWith("(") && d.name !== "(index)"
  );
  const results = [];
  for (const group of groups) {
    const configPath = path.join(
      EXPERIMENTS_DIR,
      group.name,
      "experiment.json"
    );
    if (!fs.existsSync(configPath)) {
      continue;
    }
    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch {
      continue;
    }
    const slug = config.slug;
    if (!slug) {
      continue;
    }
    const articlePath = path.join(
      EXPERIMENTS_DIR,
      group.name,
      slug,
      "article",
      "content.mdx"
    );
    let article = null;
    if (fs.existsSync(articlePath)) {
      try {
        const raw = fs.readFileSync(articlePath, "utf-8");
        const { data } = matter(raw);
        article = {
          title: data.title || config.title,
          description: data.description ?? config.description,
          descLen: (data.description ?? config.description ?? "").length,
        };
      } catch {
        article = {
          title: config.title,
          description: config.description,
          descLen: (config.description ?? "").length,
        };
      }
    }
    const descLen = (config.description ?? "").length;
    const isIndexable =
      config.status === "shipped" && (config.listing ?? "public") === "public";
    const listing = config.listing ?? "public";
    const status = config.status ?? "—";
    results.push({
      slug,
      status,
      listing,
      descLen,
      description: config.description ?? "",
      hasTags: Array.isArray(config.tags) && config.tags.length > 0,
      hasTech: Array.isArray(config.tech) && config.tech.length > 0,
      hasArticle: !!article,
      article,
      title: config.title,
      isIndexable: status === "shipped" && listing === "public",
    });
  }
  return results.sort((a, b) => a.slug.localeCompare(b.slug));
}

function runAudit() {
  const experiments = collectExperiments();
  const titleToPage = new Map();
  const descToPage = new Map();
  const flags = [];
  const SITE_TITLE = "Razi's Experiments Lab";

  for (const exp of experiments) {
    const expTitle = `${exp.title} | ${SITE_TITLE}`;
    if (expTitle.length > TITLE_MAX) {
      flags.push({
        type: "title_long",
        slug: exp.slug,
        value: expTitle.length,
        page: "experiment",
      });
    }
    if (titleToPage.has(expTitle)) {
      flags.push({
        type: "duplicate_title",
        slug: exp.slug,
        page: "experiment",
        other: titleToPage.get(expTitle),
      });
    } else {
      titleToPage.set(expTitle, exp.slug);
    }

    if (
      exp.descLen > 0 &&
      (exp.descLen < DESC_EXP_MIN || exp.descLen > DESC_EXP_MAX)
    ) {
      flags.push({
        type: "exp_desc_length",
        slug: exp.slug,
        value: exp.descLen,
        band: `${DESC_EXP_MIN}-${DESC_EXP_MAX}`,
      });
    }
    if (exp.isIndexable && !exp.hasTags && !exp.hasTech) {
      flags.push({ type: "missing_tags_tech", slug: exp.slug });
    }

    if (exp.description) {
      if (descToPage.has(exp.description)) {
        const other = descToPage.get(exp.description);
        if (other !== exp.slug && other !== `${exp.slug}/article`) {
          flags.push({
            type: "duplicate_description",
            slug: exp.slug,
            page: "experiment",
            other,
          });
        }
      } else {
        descToPage.set(exp.description, exp.slug);
      }
    }

    if (exp.article) {
      const artTitle = `${exp.article.title} — Article | ${SITE_TITLE}`;
      if (artTitle.length > TITLE_MAX) {
        flags.push({
          type: "title_long",
          slug: exp.slug,
          value: artTitle.length,
          page: "article",
        });
      }
      if (titleToPage.has(artTitle)) {
        flags.push({
          type: "duplicate_title",
          slug: exp.slug,
          page: "article",
          other: titleToPage.get(artTitle),
        });
      } else {
        titleToPage.set(artTitle, `${exp.slug}/article`);
      }

      const artDesc = exp.article.description ?? "";
      if (artDesc.length > DESC_ARTICLE_MAX) {
        flags.push({
          type: "article_desc_length",
          slug: exp.slug,
          value: exp.article.descLen,
          max: DESC_ARTICLE_MAX,
        });
      }
      if (artDesc) {
        if (descToPage.has(artDesc)) {
          const other = descToPage.get(artDesc);
          if (other !== exp.slug && other !== `${exp.slug}/article`) {
            flags.push({
              type: "duplicate_description",
              slug: exp.slug,
              page: "article",
              other,
            });
          }
        } else {
          descToPage.set(artDesc, `${exp.slug}/article`);
        }
      }
    }
  }

  return { experiments, flags };
}

function buildReport({ experiments, flags }) {
  const lines = [];
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  lines.push("# SEO keywords and content audit");
  lines.push("");
  lines.push(`**Generated:** ${now.toISOString().split("T")[0]}`);
  lines.push("");
  lines.push("## Experiments and articles");
  lines.push("");
  lines.push(
    "| Slug | Status | Listing | Exp desc len | Tags | Tech | Article | Art desc len | Article title |"
  );
  lines.push(
    "|------|--------|---------|--------------|------|------|---------|---------------|---------------|"
  );

  for (const exp of experiments) {
    const artDescLen = exp.article ? exp.article.descLen : "—";
    const artTitle = exp.article ? exp.article.title : "—";
    lines.push(
      `| ${exp.slug} | ${exp.status} | ${exp.listing} | ${exp.descLen} | ${exp.hasTags ? "✓" : "—"} | ${exp.hasTech ? "✓" : "—"} | ${exp.hasArticle ? "✓" : "—"} | ${artDescLen} | ${artTitle.slice(0, 40)}${artTitle.length > 40 ? "…" : ""} |`
    );
  }

  lines.push("");
  lines.push("## Flags");
  lines.push("");
  if (flags.length === 0) {
    lines.push("No issues flagged.");
  } else {
    const critical = flags.filter(
      (f) => f.type === "duplicate_title" || f.type === "duplicate_description"
    );
    const warnings = flags.filter(
      (f) => f.type !== "duplicate_title" && f.type !== "duplicate_description"
    );
    if (critical.length > 0) {
      lines.push("### Critical (duplicate title or description)");
      lines.push("");
      for (const f of critical) {
        lines.push(
          `- **${f.type}**: ${f.slug}${f.page ? ` (${f.page})` : ""}${f.other ? ` — also on ${f.other}` : ""}`
        );
      }
      lines.push("");
    }
    if (warnings.length > 0) {
      lines.push("### Warnings");
      lines.push("");
      for (const f of warnings) {
        const detail =
          f.value !== undefined
            ? ` (value: ${f.value}${f.band ? `, band: ${f.band}` : ""}${f.max ? `, max: ${f.max}` : ""})`
            : "";
        lines.push(`- **${f.type}**: ${f.slug}${detail}`);
      }
    }
  }

  lines.push("");
  lines.push("## Guidelines (docs/seo.md)");
  lines.push("");
  lines.push("- Experiment description: 120–160 chars (soft band 100–180).");
  lines.push("- Article description: 120–155 chars.");
  lines.push("- Page title: ~50–60 chars to avoid truncation.");
  lines.push(
    "- Indexable experiments: populate tags and tech for JSON-LD and llms.txt."
  );
  return lines.join("\n");
}

const { experiments, flags } = runAudit();
const report = buildReport({ experiments, flags });

const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2, "0");
const reportPath = path.join(
  AUDIT_DIR,
  `seo-keywords-content-${yyyy}-${mm}.md`
);
if (!fs.existsSync(AUDIT_DIR)) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}
fs.writeFileSync(reportPath, report, "utf-8");

console.log(`Wrote ${reportPath}`);
console.log(`Experiments: ${experiments.length}`);
const critical = flags.filter(
  (f) => f.type === "duplicate_title" || f.type === "duplicate_description"
);
console.log(`Flags: ${flags.length} (${critical.length} critical)`);
if (critical.length > 0) {
  console.error("Critical: duplicate title or meta description.");
  process.exit(1);
}
