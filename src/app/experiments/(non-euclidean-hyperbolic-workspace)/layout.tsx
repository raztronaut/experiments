import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";

export const metadata = {
  title: "Non-Euclidean Hyperbolic Workspace",
  description:
    "Navigate infinite information density on a Poincaré disk using non-Euclidean geometry and Möbius transformations",
  openGraph: {
    title: "Non-Euclidean Hyperbolic Workspace",
    description:
      "Navigate infinite information density on a Poincaré disk using non-Euclidean geometry and Möbius transformations",
    url: "https://www.razisyed.cv/experiments/non-euclidean-hyperbolic-workspace",
    images: ["/experiments/non-euclidean-hyperbolic-workspace/poster.jpg"],
    videos: ["/experiments/non-euclidean-hyperbolic-workspace/preview.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Non-Euclidean Hyperbolic Workspace",
    description:
      "Navigate infinite information density on a Poincaré disk using non-Euclidean geometry and Möbius transformations",
    images: ["/experiments/non-euclidean-hyperbolic-workspace/poster.jpg"],
  },
  alternates: {
    canonical:
      "https://www.razisyed.cv/experiments/non-euclidean-hyperbolic-workspace",
  },
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UmamiScript />
        <ExperimentBackButton />
        {children}
      </body>
    </html>
  );
}
