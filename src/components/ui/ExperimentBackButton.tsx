"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function ExperimentBackButton() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Only show if we are NOT in an iframe
    if (window.self === window.top) {
      setShouldShow(true);
    }
  }, []);

  if (!shouldShow) {
    return null;
  }

  return (
    <Link
      className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/50 px-4 py-2 font-medium text-sm text-white backdrop-blur-sm transition-colors hover:bg-zinc-900/70"
      data-umami-event="back_button_click"
      href="/"
      style={{ viewTransitionName: "experiment-back-button" }}
    >
      <ArrowLeft className="h-4 w-4" />
      Return to Experiments
    </Link>
  );
}
