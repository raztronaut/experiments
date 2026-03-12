"use client";

import { Callout } from "../Callout";
import { PreviewShell } from "./PreviewShell";

export function CalloutPreview() {
  return (
    <PreviewShell>
      <Callout title="Did you know?" variant="info">
        This is an informational callout used to highlight important details in
        articles.
      </Callout>
      <Callout title="Caution" variant="warning">
        Be careful when modifying shared state across concurrent renders.
      </Callout>
      <Callout title="Pro tip" variant="tip">
        Use <code>useCallback</code> to stabilize references passed to child
        components.
      </Callout>
    </PreviewShell>
  );
}
