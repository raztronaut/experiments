import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
title: 'rabbithole.chat Preloader',
description: 'A vortex gallery preloader for rabbithole.chat',
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