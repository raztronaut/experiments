import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: 'Cursor/Tilt Depth Map Explorer',
  description: 'A tomographic slice style depth map viewer for paintings using your cursor or device tilt (try on mobile too!)',
  openGraph: {
    title: 'Cursor/Tilt Depth Map Explorer',
    description: 'A tomographic slice style depth map viewer for paintings using your cursor or device tilt (try on mobile too!)',
    url: 'https://www.razisyed.cv/experiments/cursor-depth-explorer',
    images: ['/experiments/cursor-depth-explorer/poster.jpg'],
    videos: ['/experiments/cursor-depth-explorer/preview.mp4'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cursor/Tilt Depth Map Explorer',
    description: 'A tomographic slice style depth map viewer for paintings using your cursor or device tilt (try on mobile too!)',
    images: ['/experiments/cursor-depth-explorer/poster.jpg'],
  },
  alternates: {
    canonical: 'https://www.razisyed.cv/experiments/cursor-depth-explorer',
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