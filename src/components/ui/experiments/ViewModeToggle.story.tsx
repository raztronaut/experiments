"use client";

import { useState } from "react";
import { defineStory } from "@/lib/story";
import { ViewModeToggle } from "./ViewModeToggle";

function ViewModeToggleDemo() {
  const [mode, setMode] = useState<"list" | "grid">("grid");
  return <ViewModeToggle onViewModeChange={setMode} viewMode={mode} />;
}

export const story = defineStory(import.meta.url, {
  Component: ViewModeToggleDemo,
  args: [{ variant: "Default", initial: {} }],
});
