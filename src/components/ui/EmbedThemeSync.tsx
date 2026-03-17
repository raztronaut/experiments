"use client";

import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

/**
 * When the page is loaded inside an iframe with ?embed=1&theme=light|dark
 * (e.g. from LiveDemo in an article), sync the document theme to the param
 * so the embedded experiment matches the article's theme.
 * Only runs when actually in an iframe so we never overwrite the user's
 * theme when they open the experiment in a top-level tab.
 */
export function EmbedThemeSync() {
  const searchParams = useSearchParams();
  const { setTheme } = useTheme();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) {
      return;
    }
    if (typeof window === "undefined" || window.self === window.top) {
      return;
    }
    const embed = searchParams.get("embed");
    const theme = searchParams.get("theme");
    if (embed === "1" && (theme === "light" || theme === "dark")) {
      setTheme(theme);
      applied.current = true;
    }
  }, [searchParams, setTheme]);

  return null;
}
