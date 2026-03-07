import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { DevToolsInjector } from "@/components/dev";
import { ExperimentJsonLd } from "@/components/seo/ExperimentJsonLd";
import { ExperimentNav } from "@/components/ui/ExperimentNav";

export const metadata = {
  metadataBase: new URL("https://www.razisyed.cv"),
  title: "Test",
  description: "test",
  openGraph: {
    title: "Test",
    description: "test",
    url: "https://www.razisyed.cv/experiments/test",
    images: ["/experiments/test/preview.gif"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Test",
    description: "test",
    images: ["/experiments/test/preview.gif"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/test",
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
          slug="test"
          title={metadata.title as string}
        />
        <ExperimentNav />
        {children}
      </body>
    </html>
  );
}
