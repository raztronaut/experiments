"use client";

import { ComponentPreview } from "./ComponentPreview";

interface CollectedPreviewProps {
  slug: string;
  title: string;
}

function CollectedPreview({ slug, title }: CollectedPreviewProps) {
  return <ComponentPreview basePath="/collected" slug={slug} title={title} />;
}

export { CollectedPreview };
export type { CollectedPreviewProps };
