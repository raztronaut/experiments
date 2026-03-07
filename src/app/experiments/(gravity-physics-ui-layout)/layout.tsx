import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { DevToolsInjector } from "@/components/dev";
import { ExperimentJsonLd } from "@/components/seo/ExperimentJsonLd";
import { ExperimentNav } from "@/components/ui/ExperimentNav";

export const metadata = {
  metadataBase: new URL("https://www.razisyed.cv"),
  title: "OSX Cheetah UI with a surprise",
  description: "Find the hidden stupid feature!",
  openGraph: {
    title: "OSX Cheetah UI with a surprise",
    description: "Find the hidden stupid feature!",
    url: "https://www.razisyed.cv/experiments/gravity-physics-ui-layout",
    images: ["/experiments/gravity-physics-ui-layout/preview.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OSX Cheetah UI with a surprise",
    description: "Find the hidden stupid feature!",
    images: ["/experiments/gravity-physics-ui-layout/preview.png"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/gravity-physics-ui-layout",
  },
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DevToolsInjector />
        <UmamiScript />
        <ExperimentJsonLd
          description={metadata.description as string}
          slug="gravity-physics-ui-layout"
          title={metadata.title as string}
        />
        <ExperimentNav />
        {children}
      </body>
    </html>
  );
}
