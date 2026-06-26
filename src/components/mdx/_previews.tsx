"use client";

import type { ComponentType } from "react";
import { BeforeAfterImagePreview } from "./previews/BeforeAfterImagePreview";
import { CalloutPreview } from "./previews/CalloutPreview";
import { CodeBlockPreview } from "./previews/CodeBlockPreview";
import { CodeStepPreview } from "./previews/CodeStepPreview";
import { ControlsPreview } from "./previews/ControlsPreview";
import { DetailsPreview } from "./previews/DetailsPreview";
import { FullbleedPreview } from "./previews/FullbleedPreview";
import { InteractiveWidgetPreview } from "./previews/InteractiveWidgetPreview";
import { LiveDemoPreview } from "./previews/LiveDemoPreview";
import { PillPreview } from "./previews/PillPreview";
import { SandpackDemoPreview } from "./previews/SandpackDemoPreview";
import { SlideshowPreview } from "./previews/SlideshowPreview";
import { TableOfContentsPreview } from "./previews/TableOfContentsPreview";

export interface MdxPreviewEntry {
  component: ComponentType;
}

export const MDX_PREVIEWS: Record<string, MdxPreviewEntry> = {
  "mdx-before-after-image": { component: BeforeAfterImagePreview },
  "mdx-callout": { component: CalloutPreview },
  "mdx-code-block": { component: CodeBlockPreview },
  "mdx-code-step": { component: CodeStepPreview },
  "mdx-controls": { component: ControlsPreview },
  "mdx-details": { component: DetailsPreview },
  "mdx-fullbleed": { component: FullbleedPreview },
  "mdx-interactive-widget": { component: InteractiveWidgetPreview },
  "mdx-live-demo": { component: LiveDemoPreview },
  "mdx-pill": { component: PillPreview },
  "mdx-sandpack-demo": { component: SandpackDemoPreview },
  "mdx-slideshow": { component: SlideshowPreview },
  "mdx-table-of-contents": { component: TableOfContentsPreview },
};
