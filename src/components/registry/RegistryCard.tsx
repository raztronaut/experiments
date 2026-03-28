"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";

import { cn } from "@/lib/utils";

const GENERIC_PATTERNS = [
  /^Shared UI component:/,
  /^\w+ component$/,
  /^\w+ hook$/,
  /^\w+ utility$/,
];
function isGenericDescription(desc: string): boolean {
  return GENERIC_PATTERNS.some((p) => p.test(desc));
}

interface RegistryCardProps {
  category: string;
  description: string;
  library?: string;
  poster?: string;
  reference?: boolean;
  slug: string;
  source?: string;
  tags: string[];
  tech: string[];
  title: string;
  video?: string;
}

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ReactNode; gradient: string }
> = {
  components: {
    icon: (
      <svg
        className="h-8 w-8 text-muted-foreground/50"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    gradient: "from-blue-500/20 to-cyan-500/10",
  },
  hooks: {
    icon: (
      <svg
        className="h-8 w-8 text-muted-foreground/50"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    gradient: "from-violet-500/20 to-purple-500/10",
  },
  utilities: {
    icon: (
      <svg
        className="h-8 w-8 text-muted-foreground/50"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    gradient: "from-amber-500/20 to-orange-500/10",
  },
  collected: {
    icon: (
      <svg
        className="h-8 w-8 text-muted-foreground/50"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  experiments: {
    icon: (
      <svg
        className="h-8 w-8 text-muted-foreground/50"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    gradient: "from-accent to-muted",
  },
};

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    experiments: "experiment",
    components: "component",
    collected: "collected",
    hooks: "hook",
    utilities: "utility",
  };
  return labels[category] ?? category;
}

function ExternalLinkIcon() {
  return (
    <svg
      className="inline-block h-3.5 w-3.5 shrink-0 text-muted-foreground/70"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RegistryCard({
  slug,
  title,
  description,
  poster,
  video,
  tags,
  tech,
  category,
  reference,
  library,
  source,
}: RegistryCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = useCallback(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = videoRef.current;
    if (!el) {
      return;
    }
    el.pause();
    el.currentTime = 0;
  }, []);

  const hasMedia = poster || video;
  const categoryLabel = getCategoryLabel(category);
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.experiments;

  const cardClassName = cn(
    "group flex flex-col overflow-hidden rounded-lg border border-border",
    "bg-card text-card-foreground",
    "transition-colors duration-200",
    "hover:border-muted-foreground/30",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  );

  const cardContent = (
    <>
      <div className="relative aspect-video overflow-hidden bg-muted">
        {hasMedia ? (
          <>
            {poster && (
              <img
                alt={`Preview of ${title}`}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                src={poster}
              />
            )}
            {video && (
              <video
                className={cn(
                  "absolute inset-0 h-full w-full object-cover",
                  "opacity-0 transition-opacity duration-300",
                  "group-hover:opacity-100"
                )}
                loop
                muted
                playsInline
                poster={poster}
                preload="none"
                ref={videoRef}
              >
                <source src={video} type="video/mp4" />
              </video>
            )}
          </>
        ) : (
          <div
            className={cn(
              "flex h-full flex-col items-center justify-center gap-2 bg-linear-to-br",
              config.gradient
            )}
          >
            {config.icon}
            <span className="font-bold text-3xl text-muted-foreground/30">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <span className="absolute top-2 left-2 rounded-md bg-background/80 px-2 py-0.5 font-medium text-[11px] text-muted-foreground capitalize backdrop-blur-sm">
          {categoryLabel}
        </span>

        {reference && (
          <span className="absolute top-2 right-2">
            <ExternalLinkIcon />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="flex items-center gap-1.5 truncate font-semibold text-foreground text-sm">
          {title}
          {reference && <ExternalLinkIcon />}
        </h3>
        {description && !isGenericDescription(description) && (
          <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
            {description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-1 pt-2">
          {library && (
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-[10px] text-emerald-600 dark:text-emerald-400">
              {library}
            </span>
          )}
          {tech.map((t) => (
            <span
              className="rounded-full bg-accent px-2 py-0.5 font-medium text-[10px] text-accent-foreground"
              key={t}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  if (reference && source) {
    return (
      <a
        aria-label={`View ${title} (external)`}
        className={cardClassName}
        href={source}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        rel="noopener noreferrer"
        target="_blank"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <Link
      aria-label={`View ${title} ${categoryLabel}`}
      className={cardClassName}
      href={`/registry/docs/${category || "experiments"}/${slug}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {cardContent}
    </Link>
  );
}

export type { RegistryCardProps };
export { RegistryCard };
