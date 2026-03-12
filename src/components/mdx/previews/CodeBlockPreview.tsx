"use client";

import { CodeBlock } from "../CodeBlock";
import { PreviewShell } from "./PreviewShell";

export function CodeBlockPreview() {
  return (
    <PreviewShell>
      <div className="overflow-hidden rounded-lg border border-border bg-[#1e1e2e]">
        <CodeBlock data-language="tsx">
          <code className="language-tsx">
            {`function greet(name: string) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet("world"));`}
          </code>
        </CodeBlock>
      </div>
    </PreviewShell>
  );
}
