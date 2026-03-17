import { existsSync } from "node:fs";
import path from "node:path";
import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { DevToolsInjector } from "@/components/dev";
import { ExperimentJsonLd } from "@/components/seo/ExperimentJsonLd";
import { ExperimentNav } from "@/components/ui/ExperimentNav";
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
  title: "Cursor/Tilt Depth Map Explorer",
  description:
    "A tomographic slice style depth map viewer for paintings using your cursor or device tilt (try on mobile too!)",
  openGraph: {
    title: "Cursor/Tilt Depth Map Explorer",
    description:
      "A tomographic slice style depth map viewer for paintings using your cursor or device tilt (try on mobile too!)",
    url: "https://www.razisyed.cv/experiments/cursor-depth-explorer",
    images: ["/experiments/cursor-depth-explorer/poster.jpg"],
    videos: ["/experiments/cursor-depth-explorer/preview.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cursor/Tilt Depth Map Explorer",
    description:
      "A tomographic slice style depth map viewer for paintings using your cursor or device tilt (try on mobile too!)",
    images: ["/experiments/cursor-depth-explorer/poster.jpg"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/cursor-depth-explorer",
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
          slug="cursor-depth-explorer"
          title={metadata.title as string}
        />
        <ExperimentNav articleSlug={hasArticle ? experiment.slug : undefined} />
        <h1 className="sr-only">{metadata.title as string}</h1>
        {children}
      </body>
    </html>
  );
}
