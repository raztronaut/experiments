import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: 'Transit/Airport Split-Flap Display',
  description: 'A split flap display for transit/airport systems with sound effects manually made with Web Audio API',
  openGraph: {
    title: 'Transit/Airport Split-Flap Display',
    description: 'A split flap display for transit/airport systems with sound effects manually made with Web Audio API',
    url: 'https://www.razisyed.cv/experiments/transit-airport-split-flap-display',
    images: ['/experiments/transit-airport-split-flap-display/poster.jpg'],
    videos: ['/experiments/transit-airport-split-flap-display/preview.mp4'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transit/Airport Split-Flap Display',
    description: 'A split flap display for transit/airport systems with sound effects manually made with Web Audio API',
    images: ['/experiments/transit-airport-split-flap-display/poster.jpg'],
  },
  alternates: {
    canonical: 'https://www.razisyed.cv/experiments/transit-airport-split-flap-display',
  },
  authors: [{ name: 'Razi Syed', url: 'https://www.razisyed.cv' }],
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
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