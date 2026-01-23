import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: 'Non-Euclidean Hyperbolic Workspace',
  description: 'Navigate infinite information density on a Poincaré disk using non-Euclidean geometry and Möbius transformations',
  openGraph: {
    videos: ['/experiments/non-euclidean-hyperbolic-workspace/preview.mp4'],
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