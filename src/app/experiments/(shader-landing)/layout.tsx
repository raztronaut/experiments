import { existsSync } from "node:fs";
import path from "node:path";
import { Suspense } from "react";
import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { DevToolsInjector } from "@/components/dev";
import { ExperimentJsonLd } from "@/components/seo/ExperimentJsonLd";
import { ExperimentNav } from "@/components/ui/ExperimentNav";
import { RelatedExperimentsSection } from "@/components/ui/RelatedExperimentsSection";
import { getRelatedSlugs } from "@/lib/experiments";
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

export const metadata = {
  metadataBase: new URL("https://www.razisyed.cv"),
  title: "Shader Landing Experiment",
  description: "A random shader experiment",
  openGraph: {
    title: "Shader Landing Experiment",
    description: "A random shader experiment",
    url: "https://www.razisyed.cv/experiments/shader-landing",
    images: ["/experiments/shader-landing/poster.jpg"],
    videos: ["/experiments/shader-landing/preview-shader-landing.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shader Landing Experiment",
    description: "A random shader experiment",
    images: ["/experiments/shader-landing/poster.jpg"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/shader-landing",
  },
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
  robots: isPublic
    ? { index: true, follow: true, googleBot: { index: true, follow: true } }
    : { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DevToolsInjector />
        <UmamiScript />
        <ExperimentJsonLd
          description={metadata.description as string}
          slug="shader-landing"
          title={metadata.title as string}
        />
        <ExperimentNav articleSlug={hasArticle ? experiment.slug : undefined} />
        {children}
        {getRelatedSlugs(experiment)?.length > 0 && (
          <Suspense fallback={null}>
            <RelatedExperimentsSection
              slugs={getRelatedSlugs(experiment)}
              variant="experiment"
            />
          </Suspense>
        )}
      </body>
    </html>
  );
}
