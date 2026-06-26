const CODE_FENCE_RE = /```[\s\S]*?```/g;
const JSX_TAG_RE = /<\/?[A-Z][A-Za-z]*[^>]*\/?>/g;
const IMPORT_RE = /^import\s.+$/gm;
const EXPORT_RE = /^export\s.+$/gm;
const EMPTY_LINES_RE = /\n{3,}/g;

/**
 * Strip MDX-specific syntax (imports, exports, JSX components) from content,
 * preserving standard markdown and fenced code blocks.
 */
export function mdxToPlainMarkdown(mdx: string): string {
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

  return cleaned.replace(
    /__CODE_BLOCK_(\d+)__/g,
    (_match: string, idx: string) => codeBlocks[Number(idx)]
  );
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
