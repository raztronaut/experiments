"use client";

import type React from "react";
import { cn } from "@/lib/utils";

interface InteractiveWidgetProps {
  children: React.ReactNode;
  layout?: "bottom" | "sidebar";
  title?: string;
}

const PREVIEW_ROLE = Symbol.for("mdx-widget-preview");
const CONTROLS_ROLE = Symbol.for("mdx-widget-controls");

function Preview({ children }: { children: React.ReactNode }) {
  return <div className="h-full w-full">{children}</div>;
}
(Preview as unknown as Record<symbol, symbol>)[PREVIEW_ROLE] = PREVIEW_ROLE;

function Controls({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}
(Controls as unknown as Record<symbol, symbol>)[CONTROLS_ROLE] = CONTROLS_ROLE;

function findChild(children: React.ReactNode, role: symbol) {
  const arr = Array.isArray(children) ? children : [children];
  return arr.find(
    (child) =>
      child &&
      typeof child === "object" &&
      "type" in child &&
      typeof child.type !== "string" &&
      (child.type as Record<symbol, symbol>)[role] === role
  );
}

export function InteractiveWidget({
  title,
  children,
  layout = "bottom",
}: InteractiveWidgetProps) {
  const previewChild = findChild(children, PREVIEW_ROLE);
  const controlsChild = findChild(children, CONTROLS_ROLE);
  const isCompound = previewChild || controlsChild;

  if (!isCompound) {
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

  return (
    <figure className="my-8 overflow-hidden rounded-lg border border-border">
      {title && (
        <div className="border-border border-b px-4 py-2.5">
          <span className="text-muted-foreground text-sm">{title}</span>
        </div>
      )}
      <div
        className={cn(
          layout === "sidebar" ? "flex flex-col md:flex-row" : "flex flex-col"
        )}
      >
        {layout === "sidebar" && controlsChild && (
          <div className="border-border p-4 md:w-[260px] md:shrink-0 md:border-r">
            {controlsChild}
          </div>
        )}
        {previewChild && (
          <div
            className={cn(
              "flex-1 overflow-hidden",
              layout === "sidebar" ? "border-border border-t md:border-t-0" : ""
            )}
          >
            {previewChild}
          </div>
        )}
        {layout === "bottom" && controlsChild && (
          <div className="border-border border-t p-4">{controlsChild}</div>
        )}
      </div>
    </figure>
  );
}

InteractiveWidget.Preview = Preview;
InteractiveWidget.Controls = Controls;
