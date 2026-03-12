"use client";

import { Fullbleed } from "../Fullbleed";

export function FullbleedPreview() {
  return (
    <div className="mx-auto max-w-md px-6 py-10 text-foreground">
      <p className="mb-4 text-muted-foreground text-sm">
        The colored bar below breaks out of the container to span the full
        viewport width.
      </p>
      <Fullbleed>
        <div className="flex h-32 items-center justify-center bg-linear-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20">
          <span className="font-medium text-muted-foreground text-sm tracking-wider">
            Full-bleed content
          </span>
        </div>
      </Fullbleed>
      <p className="mt-4 text-muted-foreground text-sm">
        Regular content resumes within the narrow container.
      </p>
    </div>
  );
}
