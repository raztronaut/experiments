import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
title: 'Transit/Airport Split-Flap Display',
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