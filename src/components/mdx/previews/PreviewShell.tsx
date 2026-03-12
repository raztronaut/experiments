import type { ReactNode } from "react";

export function PreviewShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10 text-foreground">
      {children}
    </div>
  );
}
