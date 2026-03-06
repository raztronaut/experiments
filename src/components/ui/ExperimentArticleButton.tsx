"use client";

import { FileText, Play } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface ExperimentArticleButtonProps {
  experimentSlug: string;
}

export function ExperimentArticleButton({
  experimentSlug,
}: ExperimentArticleButtonProps) {
  const [shouldShow, setShouldShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (window.self === window.top) {
      setShouldShow(true);
    }
  }, []);

  if (!shouldShow) {
    return null;
  }

  const isOnArticle = pathname?.includes("/article");
  const href = isOnArticle
    ? `/experiments/${experimentSlug}`
    : `/experiments/${experimentSlug}/article`;
  const label = isOnArticle ? "View Experiment" : "View Article";
  const Icon = isOnArticle ? Play : FileText;

  return (
    <Link
      className="fixed top-4 left-[13.5rem] z-50 flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/50 px-4 py-2 font-medium text-sm text-white backdrop-blur-sm transition-colors hover:bg-zinc-900/70"
      data-umami-event={
        isOnArticle ? "view_experiment_click" : "view_article_click"
      }
      href={href}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
