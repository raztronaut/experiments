"use client";

import { CodeStep } from "../CodeStep";
import { PreviewShell } from "./PreviewShell";

export function CodeStepPreview() {
  return (
    <PreviewShell>
      <CodeStep step={1} title="Install dependencies">
        <p>Start by adding the required packages to your project.</p>
      </CodeStep>
      <CodeStep step={2} title="Create the component">
        <p>Build a new component that wraps the animation logic.</p>
      </CodeStep>
      <CodeStep step={3} title="Wire it up">
        <p>Import and render the component in your page.</p>
      </CodeStep>
    </PreviewShell>
  );
}
