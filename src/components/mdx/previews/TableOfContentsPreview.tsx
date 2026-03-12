"use client";

import { TableOfContents } from "../TableOfContents";
import { PreviewShell } from "./PreviewShell";

export function TableOfContentsPreview() {
  return (
    <PreviewShell>
      <p className="mb-4 text-muted-foreground text-sm">
        TableOfContents reads headings from the live DOM. In a real article it
        generates a navigable sidebar.
      </p>
      <article>
        <h2 id="overview">Overview</h2>
        <p className="text-muted-foreground text-sm">Section content...</p>
        <h2 id="getting-started">Getting Started</h2>
        <p className="text-muted-foreground text-sm">Section content...</p>
        <h3 id="prerequisites">Prerequisites</h3>
        <p className="text-muted-foreground text-sm">Section content...</p>
        <h2 id="api-reference">API Reference</h2>
        <p className="text-muted-foreground text-sm">Section content...</p>
      </article>
      <div className="mt-6 rounded-lg border border-border p-4">
        <TableOfContents />
      </div>
    </PreviewShell>
  );
}
