import { type RefObject, useEffect } from "react";

/**
 * Hook that detects clicks outside of the specified element
 * and calls the provided callback when detected.
 *
 * @param ref - React ref to the element to monitor
 * @param onClickOutside - Callback to execute when click outside is detected
 * @param enabled - Optional flag to enable/disable the hook (default: true)
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onClickOutside: () => void,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, onClickOutside, enabled]);
}
