import { Suspense } from "react";
import { existsSync } from "node:fs";
import path from "node:path";
import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { DevToolsInjector } from "@/components/dev";
import { ExperimentJsonLd } from "@/components/seo/ExperimentJsonLd";
import { ExperimentNav } from "@/components/ui/ExperimentNav";
import { RelatedExperimentsSection } from "@/components/ui/RelatedExperimentsSection";
import { getRelatedSlugs } from "@/lib/experiments";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { AUTHOR_NAME, SITE_URL } from "@/lib/constants";
import { activeFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import experiment from "./experiment.json";

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
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          crossOrigin=""
          href="https://fonts.gstatic.com"
          rel="preconnect"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "::view-transition-old(experiment-page-announcing-v2),::view-transition-new(experiment-page-announcing-v2){animation-duration:0.3s}main{view-transition-name:experiment-page-announcing-v2}",
          }}
        />
      </head>
      <body
        className={cn(
          activeFont.variable,
          "bg-[#0a0a0a] text-white antialiased"
        )}
        style={{ overflow: "auto", overscrollBehavior: "none" }}
      >
        <DevToolsInjector />
        <ExperimentJsonLd
          description={experiment.description}
          slug={experiment.slug}
          tags={experiment.tags as string[]}
          title={experiment.title}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem
          forcedTheme="dark"
        >
          <UmamiScript />
          <ExperimentNav
            articleSlug={hasArticle ? experiment.slug : undefined}
          />
          {children}
          {getRelatedSlugs(experiment)?.length > 0 && (
            <Suspense fallback={null}>
              <RelatedExperimentsSection
                slugs={getRelatedSlugs(experiment)}
                variant="experiment"
              />
            </Suspense>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
