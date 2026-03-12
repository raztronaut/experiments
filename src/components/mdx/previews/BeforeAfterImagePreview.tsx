"use client";

import { BeforeAfterImage } from "../BeforeAfterImage";
import { PreviewShell } from "./PreviewShell";

export function BeforeAfterImagePreview() {
  return (
    <PreviewShell>
      <BeforeAfterImage
        afterSrc="https://picsum.photos/seed/before/700/400"
        alt="Color grading comparison"
        beforeSrc="https://picsum.photos/seed/before/700/400?grayscale"
        height={400}
        width={700}
      />
    </PreviewShell>
  );
}
