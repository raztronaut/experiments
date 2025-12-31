import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
title: 'Non-Euclidean Hyperbolic Workspace',
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
  <ExperimentBackButton />
  {children}
</body>

</html>
);
}