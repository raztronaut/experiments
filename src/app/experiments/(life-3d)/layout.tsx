import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";

export const metadata = {
  title: "Life 3D",
  description:
    "Autonomous voxel Game of Life evolution in cubic space with high-fidelity cinematic rendering",
  openGraph: {
    title: "Life 3D",
    description:
      "Autonomous voxel Game of Life evolution in cubic space with high-fidelity cinematic rendering",
    url: "https://www.razisyed.cv/experiments/life-3d",
    images: ["/experiments/life-3d/poster.jpg"],
    videos: ["/experiments/life-3d/preview.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Life 3D",
    description:
      "Autonomous voxel Game of Life evolution in cubic space with high-fidelity cinematic rendering",
    images: ["/experiments/life-3d/poster.jpg"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/life-3d",
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
