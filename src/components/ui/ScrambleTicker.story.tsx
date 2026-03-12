import { defineStory } from "@/lib/story";
import { ScrambleTicker } from "./ScrambleTicker";

export const story = defineStory(import.meta.url, {
  Component: ScrambleTicker,
  args: [
    { variant: "Default", initial: { text: "Hello World", align: "left" } },
    {
      variant: "Centered",
      initial: { text: "Centered Text", align: "center" },
    },
    {
      variant: "Right Aligned",
      initial: { text: "Right Aligned", align: "right" },
    },
  ],
});
