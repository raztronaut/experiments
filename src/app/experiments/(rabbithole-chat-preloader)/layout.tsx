import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: 'rabbithole.chat Preloader',
  description: 'A vortex gallery shader preloader for rabbithole.chat',
  openGraph: {
    title: 'rabbithole.chat Preloader',
    description: 'A vortex gallery shader preloader for rabbithole.chat',
    url: 'https://www.razisyed.cv/experiments/rabbithole-chat-preloader',
    images: ['/experiments/rabbithole-chat-preloader/poster.jpg'],
    videos: ['/experiments/rabbithole-chat-preloader/preview.mp4'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'rabbithole.chat Preloader',
    description: 'A vortex gallery shader preloader for rabbithole.chat',
    images: ['/experiments/rabbithole-chat-preloader/poster.jpg'],
  },
  alternates: {
    canonical: 'https://www.razisyed.cv/experiments/rabbithole-chat-preloader',
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