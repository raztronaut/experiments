import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: 'Bugged Out Game of Life Shader',
  description: 'A variant of the Game of Life shader accidentally counting the decaying ghost trails as living neighbors',
  openGraph: {
    title: 'Bugged Out Game of Life Shader',
    description: 'A variant of the Game of Life shader accidentally counting the decaying ghost trails as living neighbors',
    url: 'https://www.razisyed.cv/experiments/bugged-out-game-of-life-shader-experiment',
    images: ['/experiments/bugged-out-game-of-life-shader-experiment/poster.jpg'],
    videos: ['/experiments/bugged-out-game-of-life-shader-experiment/preview.mp4'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bugged Out Game of Life Shader',
    description: 'A variant of the Game of Life shader accidentally counting the decaying ghost trails as living neighbors',
    images: ['/experiments/bugged-out-game-of-life-shader-experiment/poster.jpg'],
  },
  alternates: {
    canonical: 'https://www.razisyed.cv/experiments/bugged-out-game-of-life-shader-experiment',
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