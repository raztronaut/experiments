"use client";

import { useSearchParams } from "next/navigation";

/**
 * Returns true when `?debug` is present in the URL.
 * Follows the basement.studio Daylight pattern -- lets collaborators,
 * designers, and AI agents toggle debug views on any experiment without
 * needing the full dev environment.
 */
export function useDebug() {
  const searchParams = useSearchParams();
  return searchParams.get("debug") !== null;
}
