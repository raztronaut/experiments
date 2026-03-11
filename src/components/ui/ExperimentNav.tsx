"use client";

import { ArrowLeft, FileText, Play } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ExperimentNavProps {
  articleSlug?: string;
}

const pillClass =
  "flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/50 px-4 py-2 font-medium text-sm text-white backdrop-blur-xs transition-colors hover:bg-zinc-900/70";

export function ExperimentNav({ articleSlug }: ExperimentNavProps) {
  const pathname = usePathname();
  const isOnArticle = pathname?.includes("/article");

  return (
    <>
      {/* Hide this nav when embedded in an iframe (e.g. preview drawer).
          The inline script runs before paint, avoiding layout shift. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(window.self!==window.top){document.getElementById("experiment-nav").style.display="none"}}catch(e){}`,
        }}
      />
      <nav
        className="fixed top-4 left-4 z-50 flex items-center gap-2"
        id="experiment-nav"
      >
        <Link
          className={pillClass}
          data-umami-event="back_button_click"
          href="/"
          style={{ viewTransitionName: "experiment-back-button" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Experiments
        </Link>

        {articleSlug && (
          <Link
            className={pillClass}
            data-umami-event={
              isOnArticle ? "view_experiment_click" : "view_article_click"
            }
            href={
              isOnArticle
                ? `/experiments/${articleSlug}`
                : `/experiments/${articleSlug}/article`
            }
          >
            {isOnArticle ? (
              <>
                <Play className="h-4 w-4" />
                View Experiment
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                View Article
              </>
            )}
          </Link>
        )}
      </nav>
    </>
  );
}
