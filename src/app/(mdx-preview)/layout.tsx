import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { activeFont } from "@/lib/fonts";
import { showDevContent } from "@/lib/env";
import { cn } from "@/lib/utils";
import "./mdx-preview.css";

export const metadata = {
  title: "MDX Component Preview",
  robots: { index: false, follow: false },
};

export default function MdxPreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!showDevContent) {
    notFound();
  }

  return (
    <html className="dark" lang="en">
      <body
        className={cn(
          activeFont.className,
          activeFont.variable,
          "font-canvas antialiased"
        )}
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          overflow: "auto",
          overscrollBehavior: "none",
        }}
      >
        {children}
      </body>
    </html>
  );
}
