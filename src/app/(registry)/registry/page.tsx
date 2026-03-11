import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import {
  RegistryGrid,
  type RegistrySlimItem,
} from "@/components/registry/RegistryGrid";

export const metadata: Metadata = {
  title: "Registry",
  description:
    "Browse and install experiments, components, and hooks from Razi's creative coding lab.",
};

interface RegistryFullItem {
  description: string;
  files?: unknown[];
  name: string;
  title: string;
  [key: string]: unknown;
}

async function getRegistryItems(): Promise<RegistrySlimItem[]> {
  const registryDir = join(process.cwd(), "public", "registry");

  try {
    const slimContent = await readFile(
      join(registryDir, "index-slim.json"),
      "utf-8"
    );
    return JSON.parse(slimContent) as RegistrySlimItem[];
  } catch {
    const fullContent = await readFile(
      join(registryDir, "index.json"),
      "utf-8"
    );
    const fullItems = JSON.parse(fullContent) as RegistryFullItem[];

    return fullItems.map((item) => ({
      name: item.name,
      title: item.title ?? item.name,
      description: item.description ?? "",
    }));
  }
}

export default async function RegistryPage() {
  const items = await getRegistryItems();
  const visibleItems = items.filter(
    (item) => !("status" in item && item.status === "wip")
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <h1 className="font-semibold text-3xl text-foreground tracking-tight">
          Registry
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Installable experiments, components, and hooks.
        </p>
      </div>

      <RegistryGrid items={visibleItems} />
    </main>
  );
}
