import { existsSync } from "node:fs";
import path from "node:path";
import { Suspense } from "react";
import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { DevToolsInjector } from "@/components/dev";
import { ExperimentJsonLd } from "@/components/seo/ExperimentJsonLd";
import { EmbedThemeSync } from "@/components/ui/EmbedThemeSync";
import { ExperimentNav } from "@/components/ui/ExperimentNav";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { AUTHOR_NAME, SITE_URL } from "@/lib/constants";
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
// For experiment-specific fonts, place .woff2 files in public/experiments/{{dashCase name}}/
// and load via next/font/local with a relative src path.

// process.cwd() is stable at build time (Vercel/CI); import.meta.dirname can be undefined in Turbopack.
const hasArticle = existsSync(
  path.join(
    process.cwd(),
    `src/app/experiments/(${experiment.slug})/${experiment.slug}/article/content.mdx`
  )
);

const isPublic =
  experiment.status === "shipped" &&
  (!experiment.listing || experiment.listing === "public");

const posterPath = experiment.video
  ? `/experiments/${experiment.slug}/poster.jpg`
  : "/og-image.png";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: experiment.title,
  description: experiment.description,
  openGraph: {
    title: experiment.title,
    description: experiment.description,
    url: `${SITE_URL}/experiments/${experiment.slug}`,
    images: [posterPath],
    videos: experiment.video ? [experiment.video] : [],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: experiment.title,
    description: experiment.description,
    images: [posterPath],
  },
  alternates: {
    canonical: `${SITE_URL}/experiments/${experiment.slug}`,
  },
  authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
  robots: isPublic
    ? { index: true, follow: true, googleBot: { index: true, follow: true } }
    : { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-canvas antialiased", activeFont.variable)}>
        <style>
          {"body { view-transition-name: experiment-page-luma-morphing; }"}
        </style>
        <DevToolsInjector />
        <ExperimentJsonLd
          description={experiment.description}
          slug={experiment.slug}
          tags={experiment.tags as string[]}
          title={experiment.title}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <Suspense fallback={null}>
            <EmbedThemeSync />
          </Suspense>
          <UmamiScript />
          <ExperimentNav
            articleSlug={hasArticle ? experiment.slug : undefined}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
