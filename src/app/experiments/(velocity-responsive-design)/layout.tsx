import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { ExperimentNav } from "@/components/ui/ExperimentNav";

export const metadata = {
  metadataBase: new URL("https://www.razisyed.cv"),
  title: "Velocity-Responsive Design",
  description:
    "A 'Relativistic Reader' that adapts content density and layout based on the user's scroll speed",
  openGraph: {
    title: "Velocity-Responsive Design",
    description:
      "A 'Relativistic Reader' that adapts content density and layout based on the user's scroll speed",
    url: "https://www.razisyed.cv/experiments/velocity-responsive-design",
    images: ["/experiments/velocity-responsive-design/poster.jpg"],
    videos: ["/experiments/velocity-responsive-design/preview.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Velocity-Responsive Design",
    description:
      "A 'Relativistic Reader' that adapts content density and layout based on the user's scroll speed",
    images: ["/experiments/velocity-responsive-design/poster.jpg"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/velocity-responsive-design",
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
