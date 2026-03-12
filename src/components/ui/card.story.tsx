"use client";

import { defineStory } from "@/lib/story";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

function CardDemo() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with some example text.</p>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-sm">Card footer</p>
      </CardFooter>
    </Card>
  );
}

export const story = defineStory(import.meta.url, {
  Component: CardDemo,
  args: [{ variant: "Full Card", initial: {} }],
});
