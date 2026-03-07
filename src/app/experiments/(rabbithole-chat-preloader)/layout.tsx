import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { DevToolsInjector } from "@/components/dev";
import { ExperimentJsonLd } from "@/components/seo/ExperimentJsonLd";
import { ExperimentNav } from "@/components/ui/ExperimentNav";

export const metadata = {
  metadataBase: new URL("https://www.razisyed.cv"),
  title: "rabbithole.chat Preloader",
  description: "A vortex gallery shader preloader for rabbithole.chat",
  openGraph: {
    title: "rabbithole.chat Preloader",
    description: "A vortex gallery shader preloader for rabbithole.chat",
    url: "https://www.razisyed.cv/experiments/rabbithole-chat-preloader",
    images: ["/experiments/rabbithole-chat-preloader/poster.jpg"],
    videos: ["/experiments/rabbithole-chat-preloader/preview.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "rabbithole.chat Preloader",
    description: "A vortex gallery shader preloader for rabbithole.chat",
    images: ["/experiments/rabbithole-chat-preloader/poster.jpg"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/rabbithole-chat-preloader",
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
          slug="rabbithole-chat-preloader"
          title={metadata.title as string}
        />
        <ExperimentNav />
        {children}
      </body>
    </html>
  );
}
