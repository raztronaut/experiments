import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
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
    <html className="dark" lang="en" suppressHydrationWarning>
      <body
        className={cn(
          activeFont.className,
          activeFont.variable,
          "min-h-screen font-canvas antialiased"
        )}
      >
        <UmamiScript />
        <GrainOverlay className="pointer-events-none fixed inset-0" />
        <RootProvider
          search={{
            enabled: true,
            options: { api: "/api/registry-search" },
          }}
          theme={{ defaultTheme: "dark", enabled: false }}
        >
          {children}
        </RootProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
