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
  title: "Mountain Depth Map Shader Transition",
  description:
    "A cinematic scene transition using a depth map and FBM noise to create a volumetric reveal that respects the 3D structure of the landscape",
  openGraph: {
    title: "Mountain Depth Map Shader Transition",
    description:
      "A cinematic scene transition using a depth map and FBM noise to create a volumetric reveal that respects the 3D structure of the landscape",
    url: "https://www.razisyed.cv/experiments/mountain-transition",
    images: ["/experiments/mountain-transition/green.png"],
    videos: ["/experiments/mountain-transition/preview.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mountain Depth Map Shader Transition",
    description:
      "A cinematic scene transition using a depth map and FBM noise to create a volumetric reveal that respects the 3D structure of the landscape",
    images: ["/experiments/mountain-transition/green.png"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/mountain-transition",
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
          slug="mountain-transition"
          title={metadata.title as string}
        />
        <h1 className="sr-only">{metadata.title}</h1>
        <ExperimentNav articleSlug={hasArticle ? experiment.slug : undefined} />
        {children}
      </body>
    </html>
  );
}
