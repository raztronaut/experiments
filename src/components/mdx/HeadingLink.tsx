"use client";

import { useCallback, useState } from "react";

interface HeadingLinkProps {
  as: "h2" | "h3";
  children: React.ReactNode;
  id?: string;
}

export function HeadingLink({ as: Tag, id, children }: HeadingLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!id) {
      return;
    }
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }, [id]);

  if (!id || id.includes("footnote-label")) {
    return <Tag id={id}>{children}</Tag>;
  }

  return (
    <Tag className="group/heading relative" id={id}>
      <a
        aria-label={`Link to section: ${typeof children === "string" ? children : ""}`}
        className="absolute top-1/2 -left-6 -translate-y-1/2 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus:opacity-100 group-hover/heading:opacity-100 max-sm:hidden"
        href={`#${id}`}
        onClick={(e) => {
          e.preventDefault();
          handleCopy();
        }}
      >
        {copied ? (
          <span className="text-xs">✓</span>
        ) : (
          <span className="text-sm">#</span>
        )}
      </a>
      {children}
    </Tag>
  );
}
