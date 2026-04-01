"use client";

import { ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";
import { useMounted } from "@/hooks/useMounted";

import { cn } from "@/lib/utils";

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORTS: {
  icon: typeof Monitor;
  label: string;
  value: Viewport;
  width: string;
}[] = [
  { icon: Monitor, label: "Desktop", value: "desktop", width: "100%" },
  { icon: Tablet, label: "Tablet", value: "tablet", width: "768px" },
  { icon: Smartphone, label: "Mobile", value: "mobile", width: "375px" },
];

interface ComponentPreviewProps {
  basePath?: string;
  slug: string;
  title: string;
}

function ComponentPreview({
  basePath = "/experiments",
  slug,
  title,
}: ComponentPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();
  // Use fixed "light" until mounted so server and client initial render match (avoids hydration mismatch).
  const theme = mounted && resolvedTheme === "dark" ? "dark" : "light";
  const baseUrl = `${basePath}/${slug}`;
  const previewUrl =
    basePath === "/component-preview" ? `${baseUrl}?theme=${theme}` : baseUrl;
  const activeViewport = VIEWPORTS.find((v) => v.value === viewport)!;

  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center gap-1 border-border border-b bg-muted/30 px-4 py-2">
        {VIEWPORTS.map(({ icon: Icon, label, value }) => (
          <button
            aria-label={`${label} viewport`}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5",
              "font-medium text-xs transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              viewport === value
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            key={value}
            onClick={() => setViewport(value)}
            type="button"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex justify-center bg-muted/20">
        <div
          className="relative aspect-video w-full bg-muted transition-[max-width] duration-300 ease-in-out"
          style={{ maxWidth: activeViewport.width }}
        >
          {loading && !error && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}

          {error ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
              <p className="text-muted-foreground text-sm">
                Preview unavailable
              </p>
              <a
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5",
                  "font-medium text-foreground text-sm",
                  "border border-border bg-accent",
                  "transition-colors hover:bg-accent/80",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
                href={previewUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Open Full Page
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <iframe
              key={theme}
              className={cn(
                "absolute inset-0 h-full w-full",
                loading && "invisible"
              )}
              loading="lazy"
              onError={handleError}
              onLoad={handleLoad}
              sandbox="allow-scripts allow-same-origin allow-popups"
              src={previewUrl}
              title={title}
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-border border-t px-4 py-2.5">
        <span className="truncate font-medium text-foreground text-sm">
          {title}
        </span>
        <a
          aria-label={`Open ${title} in full page`}
          className={cn(
            "ml-3 flex shrink-0 items-center gap-1.5",
            "rounded-md px-2.5 py-1.5 font-medium text-xs",
            "text-muted-foreground transition-colors",
            "hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          href={previewUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Open Full Page
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

export type { ComponentPreviewProps };
export { ComponentPreview };
