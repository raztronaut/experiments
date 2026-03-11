import { createFileSystemCache, defineStoryFactory } from "@fumadocs/story";

export const { defineStory } = defineStoryFactory({
  cache:
    process.env.NODE_ENV === "production"
      ? createFileSystemCache(".next/fumadocs-story")
      : undefined,
});
