import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: 'Game of Life Shader',
  description: 'A variant of the Game of Life shader accidentally counting the decaying ghost trails as living neighbors',
  openGraph: {
    videos: ['/experiments/bugged-out-game-of-life-shader-experiment/preview.mp4'],
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