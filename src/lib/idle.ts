/**
 * Schedules low-priority work after the main thread is idle, keeping it off the
 * critical path. Falls back to a short timeout where requestIdleCallback is
 * unavailable (Safari), and no-ops during SSR.
 */
export function runWhenIdle(callback: () => void): void {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(callback, { timeout: 1500 });
    return;
  }

  window.setTimeout(callback, 800);
}
