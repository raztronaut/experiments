"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";

interface InstallCommandProps {
  slug: string;
}

function InstallCommand({ slug }: InstallCommandProps) {
  const command = `npx shadcn add https://www.razisyed.cv/r/${slug}`;
  return <DynamicCodeBlock code={command} lang="bash" />;
}

export { InstallCommand };
export type { InstallCommandProps };
