"use client";

import { AlertCircle, Check, Copy, ExternalLink } from "lucide-react";
import { useCallback, useState } from "react";

type CopyState = "idle" | "copied" | "error";

interface PageActionsProps {
  markdownUrl: string;
}

export function PageActions({ markdownUrl }: PageActionsProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const handleCopy = useCallback(async () => {
    try {
      const res = await fetch(markdownUrl);
      if (!res.ok) {
        throw new Error("Failed to fetch");
      }
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  }, [markdownUrl]);

  return (
    <div className="flex flex-wrap items-center gap-2 border-border border-b pb-4">
      <button
        aria-label="Copy article as Markdown"
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-muted-foreground text-xs transition-colors hover:border-foreground/20 hover:text-foreground"
        onClick={handleCopy}
        type="button"
      >
        {copyState === "copied" && (
          <>
            <Check className="h-3.5 w-3.5" />
            Copied
          </>
        )}
        {copyState === "error" && (
          <>
            <AlertCircle className="h-3.5 w-3.5" />
            Failed
          </>
        )}
        {copyState === "idle" && (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy as Markdown
          </>
        )}
      </button>
      <a
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-muted-foreground text-xs transition-colors hover:border-foreground/20 hover:text-foreground"
        href={markdownUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        View Markdown
      </a>
    </div>
  );
}
