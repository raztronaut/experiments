"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { UI_COMPONENT_PREVIEWS } from "@/components/registry/ui-component-previews";

export default function ComponentPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const entry = UI_COMPONENT_PREVIEWS[slug];

  if (!entry) {
    notFound();
  }

  const Component = entry.component;

  return <Component />;
}
