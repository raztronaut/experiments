"use client";

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";

interface SandpackDemoProps {
  dependencies?: Record<string, string>;
  editorHeight?: number;
  files: Record<string, string>;
  template?: "react" | "react-ts" | "vanilla" | "vanilla-ts";
}

export function SandpackDemo({
  files,
  template = "react",
  dependencies,
  editorHeight = 350,
}: SandpackDemoProps) {
  const { resolvedTheme } = useTheme();

  return (
    <figure className="my-8">
      <SandpackProvider
        customSetup={dependencies ? { dependencies } : undefined}
        files={files}
        template={template}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      >
        <SandpackLayout
          style={{
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
            overflow: "hidden",
          }}
        >
          <SandpackCodeEditor
            showLineNumbers
            style={{ height: editorHeight }}
          />
          <SandpackPreview style={{ height: editorHeight }} />
        </SandpackLayout>
      </SandpackProvider>
    </figure>
  );
}
