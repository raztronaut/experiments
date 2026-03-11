"use client";

import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { useEffect, useState } from "react";

interface RegistryFile {
  content: string;
  name: string;
  path?: string;
  target?: string;
  type?: string;
}

interface RegistryItemData {
  files?: RegistryFile[];
}

const EXT_TO_LANG: Record<string, string> = {
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

function getLang(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  return EXT_TO_LANG[ext ?? ""] ?? "text";
}

function getFileLabel(filename: string): string | null {
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
  };
  return map[ext] ?? null;
}

function RegistrySourceCode({ slug }: { slug: string }) {
  const [files, setFiles] = useState<RegistryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/registry/${slug}.json`);
        if (!res.ok) {
          throw new Error(`${res.status}`);
        }
        const data: RegistryItemData = await res.json();
        if (!cancelled) {
          setFiles(data.files ?? []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-4 py-3 text-fd-muted-foreground text-sm">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-fd-muted-foreground border-t-transparent" />
        Loading source...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-fd-border bg-fd-card px-4 py-3 text-fd-muted-foreground text-sm">
        Source code unavailable.
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="rounded-lg border border-fd-border bg-fd-card px-4 py-3 text-fd-muted-foreground text-sm">
        No source files.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file, index) => {
        const filename = file.name ?? file.path?.split("/").pop() ?? "unknown";
        const label = getFileLabel(filename);
        const lang = getLang(filename);

        return (
          <details
            className="group overflow-hidden rounded-lg border border-fd-border"
            key={filename}
            open={index === 0}
          >
            <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 font-medium text-fd-muted-foreground text-sm transition-colors hover:text-fd-foreground">
              <svg
                className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="m9 18 6-6-6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{file.target || filename}</span>
              {label && (
                <span className="rounded bg-fd-accent px-1.5 py-0.5 text-[10px] text-fd-accent-foreground uppercase tracking-wider">
                  {label}
                </span>
              )}
            </summary>
            <CodeBlock className="rounded-none border-0 border-fd-border border-t">
              <Pre className="max-h-[500px]">
                <code className={`language-${lang}`}>{file.content}</code>
              </Pre>
            </CodeBlock>
          </details>
        );
      })}
    </div>
  );
}

export { RegistrySourceCode };
