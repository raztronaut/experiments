import { existsSync } from "node:fs";
import path from "node:path";
import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { DevToolsInjector } from "@/components/dev";
import { ExperimentJsonLd } from "@/components/seo/ExperimentJsonLd";
import { ExperimentNav } from "@/components/ui/ExperimentNav";
import { Toaster } from "@/components/ui/sonner";
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
  title: "Terminal Cat",
  description: "Animating ASCII art in the browser console logs",
  openGraph: {
    title: "Terminal Cat",
    description: "Animating ASCII art in the browser console logs",
    url: "https://www.razisyed.cv/experiments/terminal-cat",
    images: ["/experiments/terminal-cat/preview.gif"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terminal Cat",
    description: "Animating ASCII art in the browser console logs",
    images: ["/experiments/terminal-cat/preview.gif"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/terminal-cat",
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
          slug="terminal-cat"
          title={metadata.title as string}
        />
        <ExperimentNav articleSlug={hasArticle ? experiment.slug : undefined} />
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
