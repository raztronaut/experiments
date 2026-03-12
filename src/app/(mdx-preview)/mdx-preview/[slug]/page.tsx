"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { MDX_PREVIEWS } from "@/components/mdx/_previews";

export default function MdxPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const entry = MDX_PREVIEWS[slug];

  if (!entry) {
    notFound();
  }

  const Component = entry.component;

  return <Component />;
}
