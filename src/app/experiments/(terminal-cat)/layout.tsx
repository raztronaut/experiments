import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { DevToolsInjector } from "@/components/dev";
import { ExperimentNav } from "@/components/ui/ExperimentNav";
import { Toaster } from "@/components/ui/sonner";

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
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DevToolsInjector />
        <UmamiScript />
        <ExperimentNav />
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
