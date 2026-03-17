"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * When the component-preview iframe is loaded with ?theme=light|dark (e.g. from
 * an article), set the document root class so the preview matches the article theme.
 */
export function ComponentPreviewThemeSync() {
  const searchParams = useSearchParams();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) {
      return;
    }
    const theme = searchParams.get("theme");
    const value = theme === "light" || theme === "dark" ? theme : "dark";
    document.documentElement.className = value;
    applied.current = true;
  }, [searchParams]);

  return null;
}
