import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { DevToolsInjector } from "@/components/dev";
import { ExperimentJsonLd } from "@/components/seo/ExperimentJsonLd";
import { ExperimentNav } from "@/components/ui/ExperimentNav";
import { activeFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import experiment from "./experiment.json";

// FONTS: This layout has its own <html>/<body> and does NOT inherit fonts from
// the main app layout. Only `activeFont` (the app default) is applied below.
// To use additional or custom fonts:
//   1. Import them here:  import { replica, spaceGrotesk } from "@/lib/fonts";
//      or load a local font: import localFont from "next/font/local";
//   2. Add their CSS variable classes to <body>:
//      className={cn(activeFont.variable, replica.variable, "font-replica")}
//   3. Use the variable in Tailwind via theme.extend.fontFamily or inline CSS.
// For experiment-specific fonts, place .woff2 files in public/experiments/landing-page-reveal-animation-port/
// and load via next/font/local with a relative src path.

const content = (experiment as Record<string, unknown>).content as
  | Record<string, boolean>
  | undefined;

export const metadata = {
  metadataBase: new URL("https://www.razisyed.cv"),
  title: experiment.title,
  description: experiment.description,
  openGraph: {
    title: experiment.title,
    description: experiment.description,
    url: `https://www.razisyed.cv/experiments/${experiment.slug}`,
    images: [experiment.poster || experiment.image],
    videos: experiment.video ? [experiment.video] : [],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: experiment.title,
    description: experiment.description,
    images: [experiment.poster || experiment.image],
  },
  alternates: {
    canonical: `https://www.razisyed.cv/experiments/${experiment.slug}`,
  },
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // Add "dark" to <html> className for dark-mode experiments, or other
  // class-based theming. Custom bg colors go on <body>.
  return (
    <html lang="en">
      <body
        className={cn(activeFont.variable)}
        style={{ backgroundColor: "#0f0f0f", color: "#fff" }}
      >
        <style>
          {
            "body { view-transition-name: experiment-page-landing-page-reveal-animation-port; }"
          }
        </style>
        <DevToolsInjector />
        <UmamiScript />
        <ExperimentJsonLd
          description={experiment.description}
          slug={experiment.slug}
          tags={experiment.tags as string[]}
          title={experiment.title}
        />
        <ExperimentNav
          articleSlug={content?.article ? experiment.slug : undefined}
        />
        {children}
      </body>
    </html>
  );
}
