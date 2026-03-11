import { defineStory } from "@/lib/story";
import { LiquidGlassFilter } from "./LiquidGlassFilter";

export const story = defineStory(import.meta.url, {
  Component: LiquidGlassFilter,
  args: {
    initial: {
      width: 300,
      height: 200,
      radius: 24,
      border: 1,
      blockOutBlur: 12,
      displacementScale: 30,
    },
  },
});
