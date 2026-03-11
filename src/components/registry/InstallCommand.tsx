import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";

interface InstallCommandProps {
  slug: string;
}

function InstallCommand({ slug }: InstallCommandProps) {
  const command = `npx shadcn add https://www.razisyed.cv/r/${slug}`;
  return (
    <CodeBlock>
      <Pre>
        <code>{command}</code>
      </Pre>
    </CodeBlock>
  );
}

export { InstallCommand };
export type { InstallCommandProps };
