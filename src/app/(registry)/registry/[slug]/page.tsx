import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { codeToHtml } from "shiki";
import { ExperimentPreview } from "@/components/registry/ExperimentPreview";
import { InstallCommand } from "@/components/registry/InstallCommand";
import { RegistryMeta } from "@/components/registry/RegistryMeta";

interface RegistryFile {
  content: string;
  name: string;
  path: string;
  target: string;
  type: string;
}

interface RegistryItem {
  category?: string;
  dependencies: string[];
  description: string;
  files: RegistryFile[];
  name: string;
  registryDependencies: string[];
  tags?: string[];
  tech?: string[];
  title: string;
  type: string;
}

function isExperiment(type: string): boolean {
  return type === "registry:block";
}

function getFileTypeLabel(filename: string): string | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) {
    return null;
  }
  if (filename.includes("hook") || filename.startsWith("use")) {
    return "hook";
  }
  const map: Record<string, string> = {
    tsx: "component",
    ts: "lib",
    css: "styles",
    glsl: "shader",
    frag: "shader",
    vert: "shader",
    json: "config",
    md: "docs",
  };
  return map[ext] ?? null;
}

const EXCLUDED_FILES = new Set([
  "index.json",
  "index-slim.json",
  "razi-style.json",
]);

async function getRegistryItem(slug: string): Promise<RegistryItem> {
  const filePath = join(process.cwd(), "public", "registry", `${slug}.json`);
  const content = await readFile(filePath, "utf-8");
  return JSON.parse(content) as RegistryItem;
}

interface ItemMetadata {
  category?: string;
  tags?: string[];
  tech?: string[];
  type?: string;
}

async function getItemMetadata(slug: string): Promise<ItemMetadata> {
  const indexFiles = ["index-slim.json", "index.json"];

  for (const filename of indexFiles) {
    try {
      const indexPath = join(process.cwd(), "public", "registry", filename);
      const content = await readFile(indexPath, "utf-8");
      const items = JSON.parse(content) as Array<{
        category?: string;
        name: string;
        tags?: string[];
        tech?: string[];
        type?: string;
      }>;
      const match = items.find((i) => i.name === slug);
      if (match) {
        return {
          category: match.category,
          tags: match.tags,
          tech: match.tech,
          type: match.type,
        };
      }
    } catch {
      /* index file doesn't exist yet */
    }
  }

  return {};
}

function getLang(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    tsx: "tsx",
    ts: "typescript",
    jsx: "jsx",
    js: "javascript",
    css: "css",
    glsl: "glsl",
    frag: "glsl",
    vert: "glsl",
    json: "json",
    md: "markdown",
  };
  return langMap[ext ?? ""] ?? "text";
}

async function highlightCode(code: string, filename: string): Promise<string> {
  try {
    return await codeToHtml(code, {
      lang: getLang(filename),
      theme: "github-dark",
    });
  } catch {
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre><code>${escaped}</code></pre>`;
  }
}

export async function generateStaticParams() {
  const registryDir = join(process.cwd(), "public", "registry");
  const files = await readdir(registryDir);

  return files
    .filter((f) => f.endsWith(".json") && !EXCLUDED_FILES.has(f))
    .map((f) => ({ slug: f.replace(".json", "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getRegistryItem(slug);

  return {
    title: item.title,
    description: item.description,
  };
}

export default async function RegistryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getRegistryItem(slug);
  const metadata = await getItemMetadata(slug);

  const itemType = item.type || metadata.type || "registry:block";

  const highlightedFiles = await Promise.all(
    item.files.map(async (file) => ({
      ...file,
      html: await highlightCode(file.content, file.name),
    }))
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        className="mb-8 inline-flex items-center text-muted-foreground text-sm transition-colors hover:text-foreground"
        href="/registry"
      >
        &larr; Back to Registry
      </Link>

      <div className="mt-6">
        <h1 className="font-semibold text-3xl text-foreground tracking-tight">
          {item.title}
        </h1>
        {item.description && (
          <p className="mt-2 text-base text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      <div className="mt-8 space-y-8">
        {isExperiment(itemType) && (
          <ExperimentPreview slug={slug} title={item.title} />
        )}

        <InstallCommand slug={slug} />

        <RegistryMeta
          dependencies={item.dependencies}
          fileCount={item.files.length}
          registryDependencies={item.registryDependencies}
          tags={metadata.tags ?? []}
          tech={metadata.tech ?? []}
          type={itemType}
        />

        <section>
          <h2 className="mb-4 font-medium text-foreground text-lg">
            Source Code
          </h2>
          <div className="space-y-3">
            {highlightedFiles.map((file, index) => {
              const fileType = getFileTypeLabel(file.name);
              return (
                <details
                  className="group rounded-lg border border-border"
                  key={file.name}
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground">
                    <span>{file.target || file.name}</span>
                    {fileType && (
                      <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground uppercase tracking-wider">
                        {fileType}
                      </span>
                    )}
                  </summary>
                  <div
                    className="[&_code]:counter-reset-[line] [&_code_.line]:before:counter-increment-[line] overflow-x-auto border-border border-t [&_code_.line]:before:mr-4 [&_code_.line]:before:inline-block [&_code_.line]:before:w-4 [&_code_.line]:before:text-right [&_code_.line]:before:text-zinc-600 [&_code_.line]:before:content-[counter(line)] [&_pre]:m-0 [&_pre]:rounded-none [&_pre]:border-0"
                    dangerouslySetInnerHTML={{ __html: file.html }}
                  />
                </details>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
