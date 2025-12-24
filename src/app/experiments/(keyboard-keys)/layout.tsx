import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";

export const metadata = {
title: 'Keyboard-Keys',
description: 'Interactive 3D keyboard keys with press animations',
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