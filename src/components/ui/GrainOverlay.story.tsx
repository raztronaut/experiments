import { defineStory } from "@/lib/story";
import { GrainOverlay } from "./GrainOverlay";

export const story = defineStory(import.meta.url, {
  Component: GrainOverlay,
  args: [
    {
      variant: "Default",
      initial: { className: "relative h-48 w-full" },
    },
  ],
});
