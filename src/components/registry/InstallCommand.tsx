"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

interface InstallCommandProps {
  slug: string;
}

function InstallCommand({ slug }: InstallCommandProps) {
  const [copied, setCopied] = useState(false);
  const command = `npx shadcn add https://www.razisyed.cv/r/${slug}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [command]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-muted/50">
      <pre className="overflow-x-auto p-4 pr-14 font-mono text-foreground text-sm">
        <code className="select-all">{command}</code>
      </pre>
      <button
        aria-label={copied ? "Copied to clipboard" : "Copy install command"}
        className={cn(
          "absolute top-1/2 right-2 -translate-y-1/2",
          "flex h-9 w-9 items-center justify-center rounded-md",
          "text-muted-foreground transition-colors duration-150",
          "hover:bg-accent hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        data-umami-event="registry_install_copy"
        data-umami-event-slug={slug}
        onClick={handleCopy}
        type="button"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export { InstallCommand };
export type { InstallCommandProps };
