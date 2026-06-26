"use client";

import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { replica } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { WithHover } from "./cursor/WithHover";

const HOVER_OFFSET_CONFIG = { hoverOffset: 2 } as const;

export function SiteFooter() {
  return (
    <footer className="h-card border-border/50 border-t pt-24 pb-32 text-[0.875rem] text-muted-foreground md:pt-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md space-y-4">
          <p>
            This page is created using my simple scaffolding tool to help
            developers whip up new web design/development experiments rapidly.
            Check it out here:{" "}
            <WithHover config={HOVER_OFFSET_CONFIG}>
              <a
                className="inline-flex h-fit items-center gap-1.5 rounded-md px-2 py-0.5 no-underline transition-colors hover:bg-muted/40 hover:text-foreground"
                data-umami-event="github_click"
                data-umami-event-type="repo"
                href="https://github.com/raztronaut/experiments-tool"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icons.GitHub className="h-3 w-3 opacity-60" />
                <span>experiments-tool</span>
                <Icons.ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </WithHover>
          </p>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <a
            className={cn(
              "u-url block p-name font-normal text-muted-foreground/60 text-sm no-underline",
              replica.className
            )}
            href="https://www.razisyed.cv"
            rel="me"
          >
            built by razi
          </a>
          <span className="sr-only p-job-title">Design Engineer</span>
          <div className="flex items-center gap-3">
            <WithHover config={HOVER_OFFSET_CONFIG}>
              <Link
                aria-label="GitHub"
                className="u-url inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/20 p-2 text-foreground transition-colors hover:bg-muted/40"
                data-umami-event="github_click"
                data-umami-event-type="profile"
                href="https://github.com/raztronaut"
                rel="me"
                target="_blank"
              >
                <Icons.GitHub className="h-5 w-5" />
              </Link>
            </WithHover>
            <WithHover config={HOVER_OFFSET_CONFIG}>
              <Link
                aria-label="X (formerly Twitter)"
                className="u-url inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/20 p-2 text-foreground transition-colors hover:bg-muted/40"
                data-umami-event="social_click"
                data-umami-event-platform="x"
                href="https://x.com/raztronaut"
                rel="me"
                target="_blank"
              >
                <Icons.X className="h-5 w-5" />
              </Link>
            </WithHover>
            <WithHover config={HOVER_OFFSET_CONFIG}>
              <Link
                aria-label="LinkedIn"
                className="u-url inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/20 p-2 text-foreground transition-colors hover:bg-muted/40"
                data-umami-event="social_click"
                data-umami-event-platform="linkedin"
                href="https://linkedin.com/in/raztronaut"
                rel="me"
                target="_blank"
              >
                <Icons.Linkedin className="h-5 w-5" />
              </Link>
            </WithHover>
          </div>
        </div>
      </div>
    </footer>
  );
}
