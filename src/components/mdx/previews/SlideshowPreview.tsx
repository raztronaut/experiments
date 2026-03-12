"use client";

import { Slideshow } from "../Slideshow";
import { PreviewShell } from "./PreviewShell";

export function SlideshowPreview() {
  return (
    <PreviewShell>
      <Slideshow
        alt="Demo slideshow"
        images={[
          "https://picsum.photos/seed/slide1/700/400",
          "https://picsum.photos/seed/slide2/700/400",
          "https://picsum.photos/seed/slide3/700/400",
        ]}
      />
    </PreviewShell>
  );
}
