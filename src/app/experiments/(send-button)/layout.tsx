import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { ThemeProvider } from "@/components/experiments/send-button/ThemeProvider";
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
    images: ["/experiments/send-button/preview-send-button.png"],
    videos: ["/experiments/send-button/preview-send-button.mp4"],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: experiment.title,
    description: experiment.description,
    images: ["/experiments/send-button/preview-send-button.png"],
  },
  alternates: {
    canonical: `https://www.razisyed.cv/experiments/${experiment.slug}`,
  },
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <UmamiScript />
        <ExperimentNav
          articleSlug={content?.article ? experiment.slug : undefined}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
