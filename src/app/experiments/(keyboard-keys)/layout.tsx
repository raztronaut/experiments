import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";
import { ExperimentNav } from "@/components/ui/ExperimentNav";

export const metadata = {
  metadataBase: new URL("https://www.razisyed.cv"),
  title: "Keyboard Keys",
  description:
    "Interactive 3D keyboard keys with press animation and success/error animations",
  openGraph: {
    title: "Keyboard Keys",
    description:
      "Interactive 3D keyboard keys with press animation and success/error animations",
    url: "https://www.razisyed.cv/experiments/keyboard-keys",
    images: ["/experiments/keyboard-keys/poster.jpg"],
    videos: ["/experiments/keyboard-keys/preview.mp4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Keyboard Keys",
    description:
      "Interactive 3D keyboard keys with press animation and success/error animations",
    images: ["/experiments/keyboard-keys/poster.jpg"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/keyboard-keys",
  },
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UmamiScript />
        <ExperimentNav articleSlug="keyboard-keys" />
        {children}
      </body>
    </html>
  );
}
