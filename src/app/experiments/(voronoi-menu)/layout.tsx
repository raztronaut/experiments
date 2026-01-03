import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
title: 'Voronoi-Menu',
description: 'A menu where every pixel maps to the nearest item using Voronoi partitioning',
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