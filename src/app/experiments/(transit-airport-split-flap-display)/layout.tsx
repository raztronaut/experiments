import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: 'Transit/Airport Split-Flap Display',
  description: 'A split flap display for transit/airport systems with sound effects manually made with Web Audio API',
  openGraph: {
    videos: ['/experiments/transit-airport-split-flap-display/preview.mp4'],
  },
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