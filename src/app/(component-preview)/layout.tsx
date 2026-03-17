import type { ReactNode } from "react";
import { activeFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "./component-preview.css";

export const metadata = {
  title: "Component Preview",
  robots: { index: false, follow: false },
};

export default function ComponentPreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
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
