"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "./details.css";

export interface DetailsProps {
  children: React.ReactNode;
  className?: string;
}

function Summary({ children }: { children: React.ReactNode }) {
  return (
    <summary
      className={cn(
        "relative cursor-pointer select-none list-none px-4 py-3",
        "font-medium text-muted-foreground text-sm",
        "[&::-webkit-details-marker]:hidden [&::marker]:hidden",
        "before:absolute before:top-3.5 before:left-0 before:h-4 before:w-0.5 before:rounded-full before:bg-foreground before:opacity-0 before:transition-opacity before:duration-300",
        "group-open:before:opacity-100"
      )}
    >
      <div className="flex items-center justify-between">
        {children}
        <svg
          className="h-4 w-4 shrink-0 rotate-225 text-muted-foreground transition-transform duration-300 group-open:rotate-0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </summary>
  );
}
Summary.displayName = "Summary";

function Content({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pb-4 text-muted-foreground text-sm">{children}</div>
  );
}
Content.displayName = "Content";

export function Details({ children, className }: DetailsProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleClick = useCallback((e: MouseEvent) => {
    const details = detailsRef.current;
    if (!details) {
      return;
    }

    const summary = details.querySelector("summary");
    if (!summary) {
      return;
    }

    const target = e.target as Element;
    if (!summary.contains(target)) {
      return;
    }

    if (details.hasAttribute("open")) {
      e.preventDefault();
      setIsClosing(true);
      closeTimerRef.current = setTimeout(() => {
        details.removeAttribute("open");
        setIsClosing(false);
      }, 300);
    }
  }, []);

  useEffect(() => {
    const el = detailsRef.current;
    if (!el) {
      return;
    }
    el.addEventListener("click", handleClick);
    return () => {
      el.removeEventListener("click", handleClick);
      clearTimeout(closeTimerRef.current);
    };
  }, [handleClick]);

  return (
    <details
      className={cn(
        "group my-6 overflow-hidden rounded-lg border border-border",
        isClosing && "details-closing",
        className
      )}
      ref={detailsRef}
    >
      {children}
    </details>
  );
}

Details.Summary = Summary;
Details.Content = Content;
