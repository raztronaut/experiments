import { existsSync } from "node:fs";
import path from "node:path";
import "../experiments.css";
import { Libre_Baskerville } from "next/font/google";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { DevToolsInjector } from "@/components/dev";
import { ExperimentJsonLd } from "@/components/seo/ExperimentJsonLd";
import { ExperimentNav } from "@/components/ui/ExperimentNav";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { activeFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import experiment from "./experiment.json";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre",
  display: "swap",
});

const hasArticle = existsSync(
  path.join(
    process.cwd(),
    `src/app/experiments/(${experiment.slug})/${experiment.slug}/article/content.mdx`
  )
);

const isPublic =
  experiment.status === "shipped" &&
  (!experiment.listing || experiment.listing === "public");

const posterPath = experiment.video
  ? `/experiments/${experiment.slug}/poster.jpg`
  : "/og-image.png";

export const metadata = {
  metadataBase: new URL("https://www.razisyed.cv"),
  title: experiment.title,
  description: experiment.description,
  openGraph: {
    title: experiment.title,
    description: experiment.description,
    url: `https://www.razisyed.cv/experiments/${experiment.slug}`,
    images: [posterPath],
    videos: experiment.video ? [experiment.video] : [],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: experiment.title,
    description: experiment.description,
    images: [posterPath],
  },
  alternates: {
    canonical: `https://www.razisyed.cv/experiments/${experiment.slug}`,
  },
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
  robots: isPublic
    ? { index: true, follow: true, googleBot: { index: true, follow: true } }
    : { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "font-canvas antialiased",
          activeFont.variable,
          libreBaskerville.variable
        )}
      >
        <style>
          {"body { view-transition-name: experiment-page-airplanes; }"}
        </style>
        <DevToolsInjector />
        <ExperimentJsonLd
          description={experiment.description}
          slug={experiment.slug}
          tags={experiment.tags as string[]}
          title={experiment.title}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <UmamiScript />
          <ExperimentNav
            articleSlug={hasArticle ? experiment.slug : undefined}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
