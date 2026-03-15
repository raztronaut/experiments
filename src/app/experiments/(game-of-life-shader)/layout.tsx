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
  title: "Game of Life Shader",
  description:
    "An attempt to implement Conway's Game of Life with the logic defining the shader",
  openGraph: {
    title: "Game of Life Shader",
    description:
      "An attempt to implement Conway's Game of Life with the logic defining the shader",
    url: "https://www.razisyed.cv/experiments/game-of-life-shader",
    images: ["/experiments/game-of-life-shader/poster.jpg"],
    videos: ["/experiments/game-of-life-shader/preview.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Game of Life Shader",
    description:
      "An attempt to implement Conway's Game of Life with the logic defining the shader",
    images: ["/experiments/game-of-life-shader/poster.jpg"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/game-of-life-shader",
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
          slug="game-of-life-shader"
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
