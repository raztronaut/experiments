import { defineStory } from "@/lib/story";
import { Button } from "./button";

export const story = defineStory(import.meta.url, {
  Component: Button,
  args: [
    {
      variant: "Default",
      initial: { variant: "default", size: "default", children: "Click me" },
    },
    {
      variant: "Destructive",
      initial: { variant: "destructive", children: "Delete" },
    },
    {
      variant: "Outline",
      initial: { variant: "outline", children: "Outline" },
    },
    {
      variant: "Secondary",
      initial: { variant: "secondary", children: "Secondary" },
    },
    { variant: "Ghost", initial: { variant: "ghost", children: "Ghost" } },
    { variant: "Link", initial: { variant: "link", children: "Link" } },
  ],
});
