import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { DevToolsInjector } from "@/components/dev";
import { ExperimentJsonLd } from "@/components/seo/ExperimentJsonLd";
import { ExperimentNav } from "@/components/ui/ExperimentNav";

export const metadata = {
  metadataBase: new URL("https://www.razisyed.cv"),
  title: "Mountain Depth Map Shader Transition",
  description:
    "A cinematic scene transition using a depth map and FBM noise to create a volumetric reveal that respects the 3D structure of the landscape",
  openGraph: {
    title: "Mountain Depth Map Shader Transition",
    description:
      "A cinematic scene transition using a depth map and FBM noise to create a volumetric reveal that respects the 3D structure of the landscape",
    url: "https://www.razisyed.cv/experiments/mountain-transition",
    images: ["/experiments/mountain-transition/green.png"],
    videos: ["/experiments/mountain-transition/preview.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mountain Depth Map Shader Transition",
    description:
      "A cinematic scene transition using a depth map and FBM noise to create a volumetric reveal that respects the 3D structure of the landscape",
    images: ["/experiments/mountain-transition/green.png"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/mountain-transition",
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
          slug="mountain-transition"
          title={metadata.title as string}
        />
        <h1 className="sr-only">{metadata.title}</h1>
        <ExperimentNav />
        {children}
      </body>
    </html>
  );
}
