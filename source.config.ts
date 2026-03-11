import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const registryDocs = defineDocs({
  dir: "content/registry",
});

export default defineConfig({
  mdxOptions: {
    remarkNpmOptions: {
      persist: { id: "package-manager" },
    },
  },
});
