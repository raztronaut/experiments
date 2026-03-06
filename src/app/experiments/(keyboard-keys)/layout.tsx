import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { ExperimentNav } from "@/components/ui/ExperimentNav";
import experiment from "./experiment.json";

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
    images: [`/experiments/${experiment.slug}/poster.jpg`],
    videos: experiment.video ? [experiment.video] : [],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: experiment.title,
    description: experiment.description,
    images: [`/experiments/${experiment.slug}/poster.jpg`],
  },
  alternates: {
    canonical: `https://www.razisyed.cv/experiments/${experiment.slug}`,
  },
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UmamiScript />
        <ExperimentNav
          articleSlug={content?.article ? experiment.slug : undefined}
        />
        {children}
      </body>
    </html>
  );
}
