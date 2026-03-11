"use client";

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { use } from "react";

import {
  COLLECTED_COMPONENTS,
  type CollectedEntry,
} from "@/components/collected/_map";

const componentCache = new Map<
  string,
  ReturnType<typeof dynamic<Record<string, never>>>
>();

function getOrCreateDynamic(slug: string, entry: CollectedEntry) {
  let cached = componentCache.get(slug);
  if (!cached) {
    cached = dynamic(entry.component, { ssr: false });
    componentCache.set(slug, cached);
  }
  return cached;
}

export default function CollectedPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const entry = COLLECTED_COMPONENTS[slug];

  if (!entry) {
    notFound();
  }

  const Component = getOrCreateDynamic(slug, entry);

  return <Component />;
}
