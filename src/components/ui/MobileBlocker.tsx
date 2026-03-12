"use client";

import { memo, useSyncExternalStore } from "react";

/**
 * Hook to determine if the current device should be blocked (mobile).
 * Uses useSyncExternalStore for robust window size synchronization and to avoid lint errors.
 * @see rerender-defer-reads
 */
export function useMobileBlocker() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => window.innerWidth < 768,
    () => false // SSR fallback
  );
}

/**
 * Static JSX hoisted outside the component to reduce re-render overhead.
 * @see rendering-hoist-jsx
 */
const StaticBlockerContent = (
  <div className="max-w-md space-y-4">
    <div className="mb-2 text-4xl">🖥️</div>
    <h2 className="font-semibold text-xl">Desktop Experience Required</h2>
    <p className="text-zinc-400 leading-relaxed">
      This experiment is not currently supported on mobile devices. Please visit
      on a desktop browser for the full experience.
    </p>
  </div>
);

/**
 * MobileBlocker component that displays a message for mobile users.
 * Memoized to avoid unnecessary re-renders.
 * @see rerender-memo
 */
export const MobileBlocker = memo(function MobileBlocker() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900 p-8 text-center font-sans text-zinc-100">
      {StaticBlockerContent}
    </div>
  );
});
