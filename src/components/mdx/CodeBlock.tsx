"use client";

import type React from "react";
import { useRef, useState } from "react";

interface CodeBlockProps {
  children: React.ReactNode;
  "data-language"?: string;
  "data-theme"?: string;
  raw?: string;
}

export function CodeBlock({ children, raw, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const language = props["data-language"];

  const handleCopy = async () => {
    const text = raw || preRef.current?.textContent || "";
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      {language && (
        <div className="flex items-center justify-between border-border/30 border-b px-4 py-2 text-muted-foreground text-xs">
          <span className="font-mono uppercase tracking-wider">{language}</span>
          <button
            aria-label="Copy code"
            className="text-muted-foreground transition-colors hover:text-foreground"
            onClick={handleCopy}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      <pre
        className="overflow-x-auto p-4 text-sm leading-relaxed"
        ref={preRef}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
