import { defineStory } from "@/lib/story";
import { Separator } from "./separator";

export const story = defineStory(import.meta.url, {
  Component: Separator,
  args: [
    { variant: "Horizontal", initial: { orientation: "horizontal" } },
    { variant: "Vertical", initial: { orientation: "vertical" } },
  ],
});
