/**
 * Shared MDX configuration for experiment articles.
 * Centralizes remark/rehype plugins to avoid duplication across article pages.
 *
 * Heading hierarchy: ArticleLayout renders h1 (page title). MDX content starts
 * with # which would be h1 — we use rehype-shift-heading to demote h1→h2,
 * h2→h3, etc., ensuring a single h1 per page for SEO.
 */

import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeShiftHeading from "rehype-shift-heading";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { PluggableList } from "unified";

/** Base rehype plugins: shift headings (h1→h2 so ArticleLayout h1 is sole h1), slug, syntax highlighting */
export const articleRehypePlugins: PluggableList = [
  [rehypeShiftHeading, { shift: 1 }],
  rehypeSlug,
  [
    rehypePrettyCode,
    {
      theme: { light: "github-light", dark: "github-dark" },
      keepBackground: false,
    },
  ],
];

export const articleRemarkPlugins: PluggableList = [remarkGfm];

/** For articles with LaTeX math (e.g. non-euclidean-hyperbolic-workspace) */
export const articleRemarkPluginsWithMath: PluggableList = [
  ...articleRemarkPlugins,
  remarkMath,
];

export const articleRehypePluginsWithMath: PluggableList = [
  rehypeKatex,
  ...articleRehypePlugins,
];
