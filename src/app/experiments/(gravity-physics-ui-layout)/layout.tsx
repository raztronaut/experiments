import "../experiments.css";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
  title: 'Gravity/Physics UI Layout',
  description: '',
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
        {children}
      </body>

    </html>
  );
}