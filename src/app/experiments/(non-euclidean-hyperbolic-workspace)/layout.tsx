import { existsSync } from "node:fs";
import path from "node:path";
import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { DevToolsInjector } from "@/components/dev";
import { ExperimentJsonLd } from "@/components/seo/ExperimentJsonLd";
import { ExperimentNav } from "@/components/ui/ExperimentNav";
import experiment from "./experiment.json";

const hasArticle = existsSync(
  path.join(process.cwd(), `src/app/experiments/(${experiment.slug})/${experiment.slug}/article/content.mdx`)
);

const isPublic = experiment.status === "shipped" &&
  (!experiment.listing || experiment.listing === "public");

export const metadata = {
  metadataBase: new URL("https://www.razisyed.cv"),
  title: "Non-Euclidean Hyperbolic Workspace",
  description:
    "Navigate infinite information density on a Poincaré disk using non-Euclidean geometry and Möbius transformations",
  openGraph: {
    title: "Non-Euclidean Hyperbolic Workspace",
    description:
      "Navigate infinite information density on a Poincaré disk using non-Euclidean geometry and Möbius transformations",
    url: "https://www.razisyed.cv/experiments/non-euclidean-hyperbolic-workspace",
    images: ["/experiments/non-euclidean-hyperbolic-workspace/poster.jpg"],
    videos: ["/experiments/non-euclidean-hyperbolic-workspace/preview.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Non-Euclidean Hyperbolic Workspace",
    description:
      "Navigate infinite information density on a Poincaré disk using non-Euclidean geometry and Möbius transformations",
    images: ["/experiments/non-euclidean-hyperbolic-workspace/poster.jpg"],
  },
  alternates: {
    canonical:
      "https://www.razisyed.cv/experiments/non-euclidean-hyperbolic-workspace",
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
          slug="non-euclidean-hyperbolic-workspace"
          title={metadata.title as string}
        />
        <ExperimentNav
          articleSlug={hasArticle ? experiment.slug : undefined}
        />
        {children}
      </body>
    </html>
  );
}
