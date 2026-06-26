"use client";

import { ExperimentRouteError } from "@/components/ui/ExperimentRouteError";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ExperimentRouteError {...props} slug="rabbithole-chat-preloader" />;
}
