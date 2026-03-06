import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";

export const metadata = {
  title: "Shader Landing Experiment",
  description: "A random shader experiment",
  openGraph: {
    title: "Shader Landing Experiment",
    description: "A random shader experiment",
    url: "https://www.razisyed.cv/experiments/shader-landing",
    images: ["/experiments/shader-landing/poster.jpg"],
    videos: ["/experiments/shader-landing/preview-shader-landing.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shader Landing Experiment",
    description: "A random shader experiment",
    images: ["/experiments/shader-landing/poster.jpg"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/shader-landing",
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
