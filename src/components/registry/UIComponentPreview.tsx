"use client";

import { ComponentPreview } from "./ComponentPreview";

interface UIComponentPreviewProps {
  slug: string;
  title: string;
}

function UIComponentPreview({ slug, title }: UIComponentPreviewProps) {
  return (
    <ComponentPreview basePath="/component-preview" slug={slug} title={title} />
  );
}

export type { UIComponentPreviewProps };
export { UIComponentPreview };
