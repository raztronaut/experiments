"use client";

import { useState } from "react";
import { Range } from "../controls";
import { InteractiveWidget } from "../InteractiveWidget";
import { PreviewShell } from "./PreviewShell";

export function InteractiveWidgetPreview() {
  const [value, setValue] = useState(50);
  return (
    <PreviewShell>
      <InteractiveWidget title="Spring tension">
        <div className="flex h-48 items-center justify-center bg-muted/20">
          <div
            className="h-16 w-16 rounded-xl bg-foreground transition-transform"
            style={{ transform: `scale(${0.5 + value / 100})` }}
          />
        </div>
        <div className="mt-4 border-border border-t pt-4">
          <Range
            label="Tension"
            max={100}
            min={0}
            onChange={setValue}
            step={1}
            value={value}
          />
        </div>
      </InteractiveWidget>
    </PreviewShell>
  );
}
