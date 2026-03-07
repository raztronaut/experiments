import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { DevToolsInjector } from "@/components/dev";
import { ExperimentNav } from "@/components/ui/ExperimentNav";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
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
    images: [experiment.poster],
    videos: experiment.video ? [experiment.video] : [],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: experiment.title,
    description: experiment.description,
    images: [experiment.poster],
  },
  alternates: {
    canonical: `https://www.razisyed.cv/experiments/${experiment.slug}`,
  },
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-canvas antialiased">
        <DevToolsInjector />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <UmamiScript />
          <ExperimentNav
            articleSlug={content?.article ? experiment.slug : undefined}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
