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
  title: "rabbithole.chat Gallery Explore",
  description: "3D floating gallery shader as an experimental explore page",
  openGraph: {
    title: "rabbithole.chat Gallery Explore",
    description: "3D floating gallery shader as an experimental explore page",
    url: "https://www.razisyed.cv/experiments/rabbithole-chat-gallery-explore",
    images: ["/experiments/rabbithole-chat-gallery-explore/poster.jpg"],
    videos: ["/experiments/rabbithole-chat-gallery-explore/preview.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "rabbithole.chat Gallery Explore",
    description: "3D floating gallery shader as an experimental explore page",
    images: ["/experiments/rabbithole-chat-gallery-explore/poster.jpg"],
  },
  alternates: {
    canonical:
      "https://www.razisyed.cv/experiments/rabbithole-chat-gallery-explore",
  },
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
  robots: isPublic
    ? { index: true, follow: true, googleBot: { index: true, follow: true } }
    : { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "hsl(0, 0%, 14%)",
          overscrollBehavior: "none",
        }}
      >
        <DevToolsInjector />
        <UmamiScript />
        <ExperimentJsonLd
          description={metadata.description as string}
          slug="rabbithole-chat-gallery-explore"
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
