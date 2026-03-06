"use client";

import type React from "react";

interface InteractiveWidgetProps {
  children: React.ReactNode;
  title?: string;
}

export function InteractiveWidget({ title, children }: InteractiveWidgetProps) {
  return (
    <figure className="my-8 overflow-hidden rounded-lg border border-border">
      {title && (
        <div className="border-border border-b px-4 py-2.5">
          <span className="text-muted-foreground text-sm">{title}</span>
        </div>
      )}
      <div className="p-6">{children}</div>
    </figure>
  );
}
