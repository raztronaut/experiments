"use client";

import { ComponentPreview } from "./ComponentPreview";

interface ExperimentPreviewProps {
  slug: string;
  title: string;
}

function ExperimentPreview({ slug, title }: ExperimentPreviewProps) {
  return <ComponentPreview basePath="/experiments" slug={slug} title={title} />;
}

export { ExperimentPreview };
export type { ExperimentPreviewProps };
