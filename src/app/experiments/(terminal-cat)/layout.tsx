import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";

export const metadata = {
  title: 'Terminal Cat',
  description: 'A demo of streaming ASCII animation in console',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ExperimentBackButton />
        {children}
      </body>
    </html>
  );
}
