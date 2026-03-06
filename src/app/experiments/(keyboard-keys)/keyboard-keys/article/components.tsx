"use client";

/**
 * Article-specific interactive demo components for Keyboard-Keys.
 *
 * Import these in content.mdx like:
 *   import { BasicDemo, FullDemo } from './components';
 *
 * Then use them inline:
 *   <BasicDemo />
 *   <FullDemo />
 */

export function BasicDemo() {
  return (
    <div className="flex items-center justify-center rounded-lg border border-border border-dashed bg-muted/30 p-8">
      <p className="text-muted-foreground text-sm">Basic demo placeholder</p>
    </div>
  );
}

export function FullDemo() {
  return (
    <div className="flex items-center justify-center rounded-lg border border-border border-dashed bg-muted/30 p-8">
      <p className="text-muted-foreground text-sm">Full demo placeholder</p>
    </div>
  );
}
