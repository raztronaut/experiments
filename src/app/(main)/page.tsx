import { getExperiments } from '@/lib/experiments';
import { ExperimentDrawerList } from '@/components/ui/ExperimentDrawerList';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { AIWidget } from '@/components/ui/AIWidget';
import { ThemeAwareWaves } from '@/components/ui/ThemeAwareWaves';
import { Icons } from '@/components/ui/icons';
import { WithHover } from '@/components/ui/cursor/WithHover';
import { replica, testDieGrotesk } from '@/lib/fonts';
import { cn } from '@/lib/utils';

// Revalidate experiment list every hour for ISR (Incremental Static Regeneration)
export const revalidate = 3600;

import { GrainOverlay } from "@/components/ui/GrainOverlay";

export default async function Home() {
  const experiments = await getExperiments();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <GrainOverlay />
      <div
        className="absolute inset-0 -top-20 z-0 h-[500px] w-full overflow-hidden opacity-40 pointer-events-none"
        style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent)' }}
      >
        <ThemeAwareWaves className="w-full h-full" />
      </div>
      <main className="flex-1 p-8 pt-40 md:p-24 md:pt-64 max-w-6xl mx-auto w-full">
        <div className="mb-12 relative z-10">

          <WithHover type="text" config={{ scale: 1.5 }}>
            <div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-4">
                <h1 className={cn("text-3xl md:text-5xl font-bold tracking-tight relative leading-tight", replica.className)}>razi&rsquo;s experiments</h1>
                <span className="hidden md:inline-flex w-fit px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-sm text-muted-foreground font-medium backdrop-blur-sm">
                  {experiments.length} experiments
                </span>
              </div>
              <p className={cn("text-muted-foreground text-lg mb-6 relative", testDieGrotesk.className)}>
                my lil playground for exploring ui interactions, shaders, and web techniques.
              </p>
            </div>
          </WithHover>

          <div className="flex items-center gap-4 mb-8 relative">
            <WithHover>
              <a
                href="https://github.com/raztronaut"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2 rounded-md bg-muted/20 hover:bg-muted/40 text-foreground transition-colors border border-border/50"
                aria-label="GitHub"
                data-umami-event="github_click"
                data-umami-event-type="profile"
              >
                <Icons.GitHub className="h-5 w-5" />
              </a>
            </WithHover>
            <WithHover>
              <a
                href="https://x.com/raztronaut"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2 rounded-md bg-muted/20 hover:bg-muted/40 text-foreground transition-colors border border-border/50"
                aria-label="X (Twitter)"
                data-umami-event="social_click"
                data-umami-event-platform="x"
              >
                <Icons.X className="h-5 w-5" />
              </a>
            </WithHover>
            <WithHover>
              <a
                href="https://linkedin.com/in/raztronaut"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2 rounded-md bg-muted/20 hover:bg-muted/40 text-foreground transition-colors border border-border/50"
                aria-label="LinkedIn"
                data-umami-event="social_click"
                data-umami-event-platform="linkedin"
              >
                <Icons.Linkedin className="h-5 w-5" />
              </a>
            </WithHover>
          </div>
          <p className="mt-2 text-sm text-[#14b8a6] md:hidden relative leading-relaxed">
            Swipe &lt;- or -&gt; on mobile in a card to view a preview.<br />
            But visit the experiments on desktop for best experience!
          </p>
        </div>

        <ExperimentDrawerList experiments={experiments} />
      </main>
      <div className="max-w-6xl mx-auto w-full px-8 md:px-24">
        <SiteFooter />
      </div>
      <AIWidget />
    </div>
  );
}
