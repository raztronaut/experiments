import { getExperiments } from '@/lib/experiments';
import { ExperimentDrawerList } from '@/components/ui/ExperimentDrawerList';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { AIWidget } from '@/components/ui/AIWidget';
import { Waves } from '@/components/ui/wave-background';
import { Icons } from '@/components/ui/icons';
import { WithHover } from '@/components/ui/cursor/WithHover';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const experiments = await getExperiments();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 -top-20 z-0 h-[500px] w-full overflow-hidden opacity-40 mask-image-gradient pointer-events-none">
        <Waves
          className="w-full h-full"
          strokeColor="rgba(255,255,255,0.2)"
          backgroundColor="transparent"
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>
      <main className="flex-1 p-8 pt-40 md:p-24 md:pt-64 max-w-6xl mx-auto w-full">
        <div className="mb-12 relative z-10">

          <WithHover type="text">
            <h1 className="text-3xl md:text-5xl font-medium tracking-tight mb-6 relative">razi&apos;s experiments</h1>
          </WithHover>

          <div className="flex items-center gap-4 mb-8 relative">
            <WithHover>
              <a
                href="https://github.com/raztronaut"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2 rounded-md bg-muted/20 hover:bg-muted/40 text-foreground transition-colors border border-border/50"
                aria-label="GitHub"
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
              >
                <Icons.Linkedin className="h-5 w-5" />
              </a>
            </WithHover>
          </div>
          <p className="mt-2 text-sm text-[#14b8a6] md:hidden relative">
            Swipe &lt;- or -&gt; on mobile in a card to view a preview.
          </p>
          <p className="mt-2 text-sm text-[#14b8a6] md:hidden relative">
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
