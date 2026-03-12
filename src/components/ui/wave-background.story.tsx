import { defineStory } from "@/lib/story";
import { Waves } from "./wave-background";

export const story = defineStory(import.meta.url, {
  Component: Waves,
  args: [
    {
      variant: "Dark",
      initial: {
        strokeColor: "rgba(255,255,255,0.15)",
        backgroundColor: "transparent",
      },
    },
    {
      variant: "Light",
      initial: {
        strokeColor: "rgba(0,0,0,0.1)",
        backgroundColor: "transparent",
      },
    },
  ],
});
