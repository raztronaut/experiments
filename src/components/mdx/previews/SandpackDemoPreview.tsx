"use client";

import { PreviewShell } from "./PreviewShell";

export function SandpackDemoPreview() {
  return (
    <PreviewShell>
      <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-muted/20">
        <p className="text-muted-foreground text-sm">
          SandpackDemo requires client-side Sandpack runtime.
          <br />
          See the docs page for a live example.
        </p>
      </div>
    </PreviewShell>
  );
}
