"use client";

import { Pill } from "../Pill";
import { PreviewShell } from "./PreviewShell";

export function PillPreview() {
  return (
    <PreviewShell>
      <div className="flex flex-wrap gap-2">
        <Pill variant="info">TypeScript</Pill>
        <Pill variant="success">Shipped</Pill>
        <Pill variant="warning">Experimental</Pill>
        <Pill variant="danger">Breaking</Pill>
      </div>
    </PreviewShell>
  );
}
