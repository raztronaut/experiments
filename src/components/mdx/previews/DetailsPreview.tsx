"use client";

import { Details } from "../Details";
import { PreviewShell } from "./PreviewShell";

export function DetailsPreview() {
  return (
    <PreviewShell>
      <Details>
        <Details.Summary>How does the animation system work?</Details.Summary>
        <Details.Content>
          The animation system uses GSAP ScrollTrigger under the hood, with a
          unified RAF loop managed by Tempus for consistent frame timing across
          all animated elements.
        </Details.Content>
      </Details>
      <Details>
        <Details.Summary>
          Can I use this with React Server Components?
        </Details.Summary>
        <Details.Content>
          The interactive parts require client-side JavaScript, so you&apos;ll
          need to mark the component with &quot;use client&quot; or wrap it in a
          client boundary.
        </Details.Content>
      </Details>
    </PreviewShell>
  );
}
