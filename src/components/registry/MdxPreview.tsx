"use client";

import { ComponentPreview } from "./ComponentPreview";

interface MdxPreviewProps {
  slug: string;
  title: string;
}

function MdxPreview({ slug, title }: MdxPreviewProps) {
  return <ComponentPreview basePath="/mdx-preview" slug={slug} title={title} />;
}

export { MdxPreview };
export type { MdxPreviewProps };
