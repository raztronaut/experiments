import { defineStory } from "@/lib/story";
import { Badge } from "./badge";

export const story = defineStory(import.meta.url, {
  Component: Badge,
  args: [
    {
      variant: "Default",
      initial: { variant: "default", children: "Default" },
    },
    {
      variant: "Secondary",
      initial: { variant: "secondary", children: "Secondary" },
    },
    {
      variant: "Destructive",
      initial: { variant: "destructive", children: "Destructive" },
    },
    {
      variant: "Outline",
      initial: { variant: "outline", children: "Outline" },
    },
  ],
});
