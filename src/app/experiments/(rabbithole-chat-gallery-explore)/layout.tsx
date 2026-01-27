import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: 'rabbithole.chat Gallery Explore',
  description: '3D floating gallery shader as an experimental explore page',
  openGraph: {
    title: 'rabbithole.chat Gallery Explore',
    description: '3D floating gallery shader as an experimental explore page',
    url: 'https://www.razisyed.cv/experiments/rabbithole-chat-gallery-explore',
    images: ['/experiments/rabbithole-chat-gallery-explore/poster.jpg'],
    videos: ['/experiments/rabbithole-chat-gallery-explore/preview.mp4'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'rabbithole.chat Gallery Explore',
    description: '3D floating gallery shader as an experimental explore page',
    images: ['/experiments/rabbithole-chat-gallery-explore/poster.jpg'],
  },
  alternates: {
    canonical: 'https://www.razisyed.cv/experiments/rabbithole-chat-gallery-explore',
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

      <body style={{ backgroundColor: 'hsl(0, 0%, 14%)', overscrollBehavior: 'none' }}>
        <UmamiScript />
        <ExperimentBackButton />
        {children}
      </body>

    </html>
  );
}