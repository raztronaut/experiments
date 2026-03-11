import { remarkImage } from "fumadocs-core/mdx-plugins";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const registryDocs = defineDocs({
  dir: "content/registry",
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkImage],
    remarkNpmOptions: {
      persist: { id: "package-manager" },
    },
  },
});
