import type { ReactNode } from "react";

export const metadata = {
  title: "Collected Component Preview",
  robots: { index: false, follow: false },
};

export default function CollectedPreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html className="dark" lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#0a0a0a",
          color: "#fff",
          overflow: "auto",
          overscrollBehavior: "none",
        }}
      >
        {children}
      </body>
    </html>
  );
}
