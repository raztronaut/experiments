import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { ExperimentNav } from "@/components/ui/ExperimentNav";

export const metadata = {
  metadataBase: new URL("https://www.razisyed.cv"),
  title: "Game of Life Shader",
  description:
    "An attempt to implement Conway's Game of Life with the logic defining the shader",
  openGraph: {
    title: "Game of Life Shader",
    description:
      "An attempt to implement Conway's Game of Life with the logic defining the shader",
    url: "https://www.razisyed.cv/experiments/game-of-life-shader",
    images: ["/experiments/game-of-life-shader/poster.jpg"],
    videos: ["/experiments/game-of-life-shader/preview.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Game of Life Shader",
    description:
      "An attempt to implement Conway's Game of Life with the logic defining the shader",
    images: ["/experiments/game-of-life-shader/poster.jpg"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/game-of-life-shader",
  },
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UmamiScript />
        <ExperimentNav />
        {children}
      </body>
    </html>
  );
}
