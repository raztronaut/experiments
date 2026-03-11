import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import Link from "next/link";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { activeFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "./registry.css";

export const metadata: Metadata = {
  title: {
    default: "Razi's Registry",
    template: "%s | Razi's Registry",
  },
  description:
    "Installable experiments, components, and hooks from Razi's creative coding lab.",
  metadataBase: new URL("https://www.razisyed.cv"),
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegistryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <body
        className={cn(
          activeFont.className,
          activeFont.variable,
          "min-h-screen bg-background font-canvas text-foreground antialiased"
        )}
      >
        <UmamiScript />
        <GrainOverlay className="fixed inset-0 z-50" />
        <header className="border-border/40 border-b">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link
              className="font-medium text-foreground text-sm tracking-tight"
              data-umami-event="registry_nav_home"
              href="/registry"
            >
              razi&apos;s registry
            </Link>
            <Link
              className="text-muted-foreground text-sm transition-colors hover:text-foreground"
              data-umami-event="registry_nav_back"
              href="/"
            >
              &larr; back to site
            </Link>
          </div>
        </header>
        {children}
        <footer className="border-border/40 border-t py-6 text-center">
          <p className="text-muted-foreground text-xs">
            Built by{" "}
            <a
              className="text-foreground transition-colors hover:text-muted-foreground"
              href="https://www.razisyed.cv"
            >
              Razi Syed
            </a>
            {" · "}
            <a
              className="text-foreground transition-colors hover:text-muted-foreground"
              href="https://github.com/raztronaut/experiments"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </p>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
