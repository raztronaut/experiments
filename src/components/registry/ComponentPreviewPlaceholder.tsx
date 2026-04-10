"use client";

interface ComponentPreviewPlaceholderProps {
  slug: string;
  title?: string;
}

function ComponentPreviewPlaceholder({
  slug,
  title,
}: ComponentPreviewPlaceholderProps) {
  const displayName = title ?? slug;

  return (
    <div className="rounded-lg border border-border bg-muted/20 px-6 py-8 text-center">
      <p className="text-muted-foreground text-sm">
        Preview not yet added for{" "}
        <strong className="text-foreground">{displayName}</strong>.
      </p>
      <p className="mt-1 text-muted-foreground text-xs">
        Add an entry to{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          UI_COMPONENT_PREVIEWS
        </code>{" "}
        in{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          ui-component-previews.tsx
        </code>{" "}
        to show a live preview here.
      </p>
    </div>
  );
}

export type { ComponentPreviewPlaceholderProps };
export { ComponentPreviewPlaceholder };
