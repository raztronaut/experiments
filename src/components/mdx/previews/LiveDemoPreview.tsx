"use client";

import { LiveDemo } from "../LiveDemo";
import { PreviewShell } from "./PreviewShell";

export function LiveDemoPreview() {
  return (
    <PreviewShell>
      <LiveDemo height="300px" slug="keyboard-keys" />
    </PreviewShell>
  );
}
