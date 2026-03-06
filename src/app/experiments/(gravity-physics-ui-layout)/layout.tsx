import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: "OSX Cheetah UI with a surprise",
  description: "Find the hidden stupid feature!",
  openGraph: {
    title: "OSX Cheetah UI with a surprise",
    description: "Find the hidden stupid feature!",
    url: "https://www.razisyed.cv/experiments/gravity-physics-ui-layout",
    images: ["/experiments/gravity-physics-ui-layout/preview.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OSX Cheetah UI with a surprise",
    description: "Find the hidden stupid feature!",
    images: ["/experiments/gravity-physics-ui-layout/preview.png"],
  },
  alternates: {
    canonical: "https://www.razisyed.cv/experiments/gravity-physics-ui-layout",
  },
  authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UmamiScript />
        {children}
      </body>
    </html>
  );
}
