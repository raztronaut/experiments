"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  level: string;
  text: string;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  const getHeadings = useCallback(
    () =>
      Array.from(
        document.querySelectorAll(
          "article h1[id], article h2[id], article h3[id]"
        )
      ).map((el) => ({
        id: el.id,
        text: el.textContent || "",
        level: el.tagName.toLowerCase(),
      })),
    []
  );

  useEffect(() => {
    const collected = getHeadings();
    setHeadings(collected);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    for (const heading of collected) {
      const el = document.getElementById(heading.id);
      if (el) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, [getHeadings]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute("data-highlight", "true");
      setTimeout(() => el.setAttribute("data-highlight", "false"), 2000);

      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
        On this page
      </p>
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              type="button"
              className={cn(
                "block w-full border-l-2 py-1 text-left text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
                heading.level === "h1" && "pl-3",
                heading.level === "h2" && "pl-5",
                heading.level === "h3" && "pl-7",
                activeId === heading.id
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent"
              )}
              onClick={() => scrollTo(heading.id)}
              aria-current={activeId === heading.id ? "true" : undefined}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
