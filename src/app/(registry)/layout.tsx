import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { DeferredVercelAnalytics } from "@/components/analytics/DeferredVercelAnalytics";
import { UmamiScript } from "@/components/analytics/UmamiScript";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://vitals.vercel-insights.com" rel="preconnect" />
      </head>
      <body
        className={cn(
          activeFont.className,
          activeFont.variable,
          "min-h-screen font-canvas antialiased"
        )}
      >
        <UmamiScript />
        <RootProvider
          search={{
            enabled: true,
            options: { api: "/api/registry-search" },
          }}
          theme={{ defaultTheme: "dark" }}
        >
          {children}
        </RootProvider>
        <DeferredVercelAnalytics />
      </body>
    </html>
  );
}
