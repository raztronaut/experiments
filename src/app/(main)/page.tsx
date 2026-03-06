import { AIWidget } from "@/components/ui/AIWidget";
import { WithHover } from "@/components/ui/cursor/WithHover";
import { ExperimentDrawerList } from "@/components/ui/ExperimentDrawerList";
import { Icons } from "@/components/ui/icons";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { ThemeAwareWaves } from "@/components/ui/ThemeAwareWaves";
import { getExperiments } from "@/lib/experiments";
import { replica, testDieGrotesk } from "@/lib/fonts";
import { cn } from "@/lib/utils";

// Revalidate experiment list every hour for ISR (Incremental Static Regeneration)
export const revalidate = 3600;

import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { LocationStatus } from "@/components/ui/LocationStatus";

// Attempt 1: Fix cursor distortion in header/hero area.
// The custom cursor's mix-blend-mode: difference interacts poorly with the
// stacking context of the masked waves and grain overlay in Chromium.
// Solution: Apply isolation: isolate to the hero container to force a new stacking context,
// preventing the blend mode from "leaking" or distorting against the complex background layers.

export default async function Home() {
  const experiments = await getExperiments();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <GrainOverlay />
      <div
        className="pointer-events-none absolute inset-0 -top-20 z-0 h-[500px] w-full overflow-hidden opacity-40"
        style={{
          maskImage: "linear-gradient(to bottom, black 60%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent)",
        }}
      >
        <ThemeAwareWaves className="h-full w-full" />
      </div>
      <main className="relative isolate z-10 mx-auto w-full max-w-6xl flex-1 p-4 pt-40 md:p-24 md:pt-64">
        <div className="relative z-10 mb-8 md:mb-12">
          <div>
            <div className="relative mb-6 md:mb-8">
              <LocationStatus />
            </div>
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <WithHover config={{ scale: 1.5 }} type="text">
                <h1
                  className={cn(
                    "relative w-fit font-bold text-3xl leading-tight tracking-tight md:text-5xl",
                    replica.className
                  )}
                >
                  razi&rsquo;s experiments
                </h1>
              </WithHover>
            </div>
            <WithHover config={{ scale: 1.5 }} type="text">
              <p
                className={cn(
                  "relative mb-6 w-fit text-lg text-muted-foreground",
                  testDieGrotesk.className
                )}
              >
                my lil playground for exploring ui interactions, shaders, and
                web techniques.
              </p>
            </WithHover>
          </div>

          {/* Social Links - Mobile Only */}
          <div className="relative mb-8 flex items-center gap-4 md:hidden">
            <WithHover>
              <a
                aria-label="GitHub"
                className="inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/20 p-2 text-foreground transition-colors hover:bg-muted/40"
                data-umami-event="github_click"
                data-umami-event-type="profile"
                href="https://github.com/raztronaut"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icons.GitHub className="h-5 w-5" />
              </a>
            </WithHover>
            <WithHover>
              <a
                aria-label="X (Twitter)"
                className="inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/20 p-2 text-foreground transition-colors hover:bg-muted/40"
                data-umami-event="social_click"
                data-umami-event-platform="x"
                href="https://x.com/raztronaut"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icons.X className="h-5 w-5" />
              </a>
            </WithHover>
            <WithHover>
              <a
                aria-label="LinkedIn"
                className="inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/20 p-2 text-foreground transition-colors hover:bg-muted/40"
                data-umami-event="social_click"
                data-umami-event-platform="linkedin"
                href="https://linkedin.com/in/raztronaut"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icons.Linkedin className="h-5 w-5" />
              </a>
            </WithHover>
          </div>
        </div>

        <ExperimentDrawerList experiments={experiments} />
      </main>
      <div className="mx-auto w-full max-w-6xl px-8 md:px-24">
        <SiteFooter />
      </div>
      <AIWidget />
    </div>
  );
}
